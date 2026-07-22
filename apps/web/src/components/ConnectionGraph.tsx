"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import Link from "next/link"
import * as d3 from "d3"

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string
  reference: string
  type: string
  arabic?: string
  confidence?: number
  ref_type?: string
  isCenter?: boolean
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  ref_type: string
  confidence: number
}

interface Props {
  centerNode: { id: string; reference: string; type: string; arabic?: string }
  connections: Record<string, unknown>[]
}

const TYPE_COLORS: Record<string, { color: string; label: string; bg: string }> = {
  quran:  { color: "#c9a84c", label: "Coran",  bg: "rgba(201, 168, 76, 0.15)" },
  hadith: { color: "#60a5fa", label: "Hadith", bg: "rgba(96, 165, 250, 0.15)" },
  tafsir: { color: "#c084fc", label: "Tafsir", bg: "rgba(192, 132, 252, 0.15)" },
}

export default function ConnectionGraph({ centerNode, connections }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  // Interactive filter controls state
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(0.70)
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    new Set(["quran", "hadith", "tafsir"]),
  )
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)

  // Calculate count per type for current dataset
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { quran: 0, hadith: 0, tafsir: 0 }
    connections.forEach((c) => {
      const t = ((c.source_type as string) || (c.type as string) || "hadith").toLowerCase()
      if (counts[t] !== undefined) counts[t]++
      else counts[t] = 1
    })
    return counts
  }, [connections])

  // Filter connections by similarity threshold and selected type
  const filteredConnections = useMemo(() => {
    return connections.filter((c) => {
      const type = ((c.source_type as string) || (c.type as string) || "hadith").toLowerCase()
      const confidence = (c.confidence as number) ?? 1.0
      const matchesThreshold = confidence >= similarityThreshold
      const matchesType = selectedTypes.has(type)
      return matchesThreshold && matchesType
    })
  }, [connections, similarityThreshold, selectedTypes])

  const toggleTypeFilter = (type: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        if (next.size > 1) next.delete(type) // keep at least 1 selected
      } else {
        next.add(type)
      }
      return next
    })
  }

  // D3 force graph simulation effect
  useEffect(() => {
    if (!svgRef.current) return

    const width = svgRef.current.clientWidth || 480
    const height = svgRef.current.clientHeight || 340

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()
    svg.attr("viewBox", `0 0 ${width} ${height}`)

    // Container receiving zoom transforms
    const root = svg.append("g")

    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.4, 3])
        .on("zoom", (event) => root.attr("transform", event.transform)),
    )

    const nodes: GraphNode[] = [
      { ...centerNode, isCenter: true, type: centerNode.type.toLowerCase() },
      ...filteredConnections.slice(0, 25).map((c) => ({
        id: c.id as string,
        reference: c.reference as string,
        type: ((c.source_type as string) || (c.type as string) || "hadith").toLowerCase(),
        arabic: c.arabic as string | undefined,
        confidence: c.confidence as number | undefined,
        ref_type: c.ref_type as string | undefined,
      })),
    ]

    const links: GraphLink[] = filteredConnections.slice(0, 25).map((c) => ({
      source: centerNode.id,
      target: c.id as string,
      ref_type: (c.ref_type as string) ?? "référence",
      confidence: (c.confidence as number) ?? 1.0,
    }))

    const simulation = d3
      .forceSimulation(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide(36))

    // Links
    const link = root
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.max(1.5, d.confidence * 4))
      .attr("stroke", (d) => (d.confidence >= 0.85 ? "#c9a84c" : "#3b4252"))
      .attr("stroke-opacity", (d) => Math.max(0.4, d.confidence))

    // Tooltip div
    const parentElem = svgRef.current.parentElement
    const tooltip = d3
      .select(parentElem)
      .append("div")
      .attr("role", "tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "var(--color-surface, #0d1510)")
      .style("border", "1px solid var(--color-border, rgba(250,247,239,0.12))")
      .style("border-radius", "8px")
      .style("padding", "8px 12px")
      .style("font-size", "11px")
      .style("color", "var(--color-text-muted, #8888aa)")
      .style("max-width", "220px")
      .style("z-index", "40")
      .style("opacity", "0")
      .style("transition", "opacity 0.15s")
      .style("box-shadow", "0 10px 25px -5px rgba(0,0,0,0.5)")

    // Nodes
    const node = root
      .append("g")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes)
      .join("g")
      .style("cursor", (d) => (d.isCenter ? "default" : "pointer"))
      .on("click", (event, d) => {
        event.stopPropagation()
        if (!d.isCenter) {
          setSelectedNode(d)
        }
      })
      .on("mouseenter", (event, d) => {
        if (!parentElem) return
        const rect = parentElem.getBoundingClientRect()
        const x = event.clientX - rect.left + 12
        const y = event.clientY - rect.top - 12
        const snippet = d.arabic ? d.arabic.slice(0, 70) + (d.arabic.length > 70 ? "…" : "") : ""
        const score = d.confidence ? ` · ${Math.round(d.confidence * 100)}%` : ""
        const typeInfo = TYPE_COLORS[d.type]?.label ?? d.type

        tooltip
          .style("left", `${x}px`)
          .style("top", `${y}px`)
          .style("opacity", "1")
          .html(
            `<div style="font-size:10px;font-weight:bold;color:${TYPE_COLORS[d.type]?.color || "#888"};margin-bottom:2px">${typeInfo}${score}</div>` +
            `<div style="font-weight:600;color:var(--color-text,#FAF7EF);margin-bottom:4px">${d.reference}</div>` +
            (snippet ? `<div style="font-family:serif;direction:rtl;color:var(--color-gold,#c9a84c);line-height:1.4">${snippet}</div>` : ""),
          )
      })
      .on("mousemove", (event) => {
        if (!parentElem) return
        const rect = parentElem.getBoundingClientRect()
        tooltip
          .style("left", `${event.clientX - rect.left + 12}px`)
          .style("top", `${event.clientY - rect.top - 12}px`)
      })
      .on("mouseleave", () => tooltip.style("opacity", "0"))
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on("drag", (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          }),
      )

    node
      .append("circle")
      .attr("r", (d) => (d.isCenter ? 22 : 14))
      .attr("fill", (d) => TYPE_COLORS[d.type]?.color ?? "#888")
      .attr("fill-opacity", (d) => (d.isCenter ? 1 : 0.8))
      .attr("stroke", (d) => (d.isCenter ? "#fff" : "rgba(255,255,255,0.3)"))
      .attr("stroke-width", (d) => (d.isCenter ? 2.5 : 1.5))
      .style("filter", (d) => (d.isCenter ? "drop-shadow(0 0 8px rgba(201,168,76,0.6))" : "none"))

    node
      .append("text")
      .text((d) => d.reference)
      .attr("text-anchor", "middle")
      .attr("dy", "3.2em")
      .attr("font-size", "10px")
      .attr("font-weight", "500")
      .attr("fill", "#a0a0c0")
      .style("pointer-events", "none")

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x ?? 0)
        .attr("y1", (d) => (d.source as GraphNode).y ?? 0)
        .attr("x2", (d) => (d.target as GraphNode).x ?? 0)
        .attr("y2", (d) => (d.target as GraphNode).y ?? 0)
      node.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })

    return () => {
      simulation.stop()
      tooltip.remove()
    }
  }, [centerNode, filteredConnections])

  if (connections.length === 0) {
    return (
      <div
        className="rounded-xl border flex items-center justify-center h-64 p-6 text-center"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
      >
        <p className="text-sm">Aucune connexion disponible pour ce texte.</p>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl border overflow-hidden relative flex flex-col gap-0 shadow-lg"
      style={{ background: "var(--color-surface, #0d1510)", borderColor: "var(--color-border)" }}
    >
      {/* Control Panel Bar */}
      <div className="p-4 border-b flex flex-col gap-3" style={{ borderColor: "var(--color-border)", background: "rgba(0,0,0,0.2)" }}>
        {/* Cosine Similarity Threshold Slider */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Seuil Cosinus (Similarité Sémantique) :
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {similarityThreshold.toFixed(2)} ({Math.round(similarityThreshold * 100)}%)
            </span>
          </div>
          <span className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
            {filteredConnections.length} / {connections.length} nœuds affichés
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono" style={{ color: "var(--color-text-muted)" }}>0.70</span>
          <input
            type="range"
            min="0.70"
            max="0.95"
            step="0.01"
            value={similarityThreshold}
            onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 rounded-lg bg-gray-700"
            aria-label="Filtre seuil de similarité cosinus"
          />
          <span className="text-[10px] font-mono" style={{ color: "var(--color-text-muted)" }}>0.95</span>
        </div>

        {/* Node Type Filters */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs font-semibold uppercase tracking-wider mr-1" style={{ color: "var(--color-text-muted)" }}>
            Filtrer par type :
          </span>
          {Object.entries(TYPE_COLORS).map(([typeKey, config]) => {
            const isSelected = selectedTypes.has(typeKey)
            const count = typeCounts[typeKey] || 0

            return (
              <button
                key={typeKey}
                onClick={() => toggleTypeFilter(typeKey)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-all ${
                  isSelected ? "opacity-100 shadow-sm" : "opacity-40 grayscale"
                }`}
                style={{
                  background: isSelected ? config.bg : "transparent",
                  borderColor: isSelected ? config.color : "var(--color-border)",
                  color: isSelected ? config.color : "var(--color-text-muted)",
                }}
                aria-pressed={isSelected}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: config.color }} />
                <span>{config.label}</span>
                <span className="text-[10px] px-1 rounded bg-black/30 font-mono">
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full">
        <div className="absolute top-2 right-3 text-[11px] font-mono pointer-events-none" style={{ color: "var(--color-text-muted)", zIndex: 10 }}>
          Scroll pour zoomer · Drag pour déplacer · Clic sur un nœud pour aperçu
        </div>

        {filteredConnections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
            <p className="text-sm font-medium text-amber-400 mb-1">
              Aucun nœud ne correspond aux filtres actuels.
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Diminuez le seuil de similarité ou réactivez les types de textes.
            </p>
          </div>
        ) : (
          <svg ref={svgRef} className="w-full" style={{ height: "clamp(300px, 55vw, 420px)" }} />
        )}
      </div>

      {/* Detail Preview Drawer on Node Selection */}
      {selectedNode && (
        <div
          className="p-4 border-t flex flex-col gap-3 transition-all animate-fade-in"
          style={{
            background: "rgba(20, 27, 22, 0.95)",
            borderColor: TYPE_COLORS[selectedNode.type]?.color || "var(--color-gold)",
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                style={{
                  background: TYPE_COLORS[selectedNode.type]?.bg || "rgba(255,255,255,0.1)",
                  color: TYPE_COLORS[selectedNode.type]?.color || "#fff",
                }}
              >
                {TYPE_COLORS[selectedNode.type]?.label || selectedNode.type}
              </span>
              <h4 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
                {selectedNode.reference}
              </h4>
              {selectedNode.confidence && (
                <span className="text-xs font-mono font-semibold text-amber-400">
                  Similarité: {Math.round(selectedNode.confidence * 100)}%
                </span>
              )}
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs px-2.5 py-1 rounded border hover:bg-white/10 flex items-center gap-1.5"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
              aria-label="Fermer l'aperçu"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Fermer
            </button>
          </div>

          {selectedNode.arabic && (
            <p className="arabic text-base leading-relaxed line-clamp-3 p-3 rounded-lg border text-right dir-rtl" style={{ background: "rgba(0,0,0,0.3)", borderColor: "var(--color-border)", color: "var(--color-gold)" }}>
              {selectedNode.arabic}
            </p>
          )}

          <div className="flex justify-end">
            <Link
              href={`/text/${selectedNode.id}`}
              className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg border transition-all hover:bg-amber-500 text-amber-400 hover:text-black"
              style={{ borderColor: TYPE_COLORS[selectedNode.type]?.color || "var(--color-gold)" }}
            >
              Consulter le texte complet →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
