"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface GraphNode extends d3.SimulationNodeDatum {
  id: string
  reference: string
  type: string
  arabic?: string
  isCenter?: boolean
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  ref_type: string
  confidence: number
}

interface Props {
  centerNode: { id: string; reference: string; type: string }
  connections: Record<string, unknown>[]
}

const TYPE_COLORS: Record<string, string> = {
  quran:  "#c9a84c",
  hadith: "#60a5fa",
  tafsir: "#c084fc",
  fiqh:   "#fb923c",
}

export default function ConnectionGraph({ centerNode, connections }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const width = svgRef.current.clientWidth || 480
    const height = svgRef.current.clientHeight || 320

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()
    svg.attr("viewBox", `0 0 ${width} ${height}`)

    // Container that receives zoom transforms
    const root = svg.append("g")

    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.4, 3])
        .on("zoom", (event) => root.attr("transform", event.transform)),
    )

    const nodes: GraphNode[] = [
      { ...centerNode, isCenter: true },
      ...connections.slice(0, 20).map((c) => ({
        id: c.id as string,
        reference: c.reference as string,
        type: c.source_type as string,
        arabic: c.arabic as string | undefined,
      })),
    ]

    const links: GraphLink[] = connections.slice(0, 20).map((c) => ({
      source: centerNode.id,
      target: c.id as string,
      ref_type: c.ref_type as string,
      confidence: c.confidence as number,
    }))

    const simulation = d3
      .forceSimulation(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance(110))
      .force("charge", d3.forceManyBody().strength(-280))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide(34))

    // Liens
    const link = root
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.max(1, d.confidence * 3))
      .attr("stroke", "#2a2a3a")
      .attr("stroke-opacity", 0.8)

    // Tooltip div (outside SVG, positioned absolutely)
    const tooltip = d3
      .select(svgRef.current.parentElement)
      .append("div")
      .attr("role", "tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "var(--color-surface)")
      .style("border", "1px solid var(--color-border)")
      .style("border-radius", "8px")
      .style("padding", "8px 12px")
      .style("font-size", "11px")
      .style("color", "var(--color-text-muted)")
      .style("max-width", "200px")
      .style("z-index", "50")
      .style("opacity", "0")
      .style("transition", "opacity 0.15s")

    // Nœuds
    const node = root
      .append("g")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes)
      .join("g")
      .style("cursor", (d) => (d.isCenter ? "default" : "pointer"))
      .on("click", (_, d) => {
        if (!d.isCenter) window.location.href = `/text/${d.id}`
      })
      .on("mouseenter", (event, d) => {
        const parent = svgRef.current?.parentElement
        if (!parent) return
        const rect = parent.getBoundingClientRect()
        const x = event.clientX - rect.left + 12
        const y = event.clientY - rect.top - 12
        const snippet = d.arabic ? d.arabic.slice(0, 60) + (d.arabic.length > 60 ? "…" : "") : ""
        tooltip
          .style("left", `${x}px`)
          .style("top", `${y}px`)
          .style("opacity", "1")
          .html(
            `<div style="font-family:serif;direction:rtl;color:var(--color-text);margin-bottom:4px">${snippet}</div>` +
            `<div>${d.reference}</div>`,
          )
      })
      .on("mousemove", (event) => {
        const parent = svgRef.current?.parentElement
        if (!parent) return
        const rect = parent.getBoundingClientRect()
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
      .attr("r", (d) => (d.isCenter ? 20 : 13))
      .attr("fill", (d) => TYPE_COLORS[d.type] ?? "#888")
      .attr("fill-opacity", (d) => (d.isCenter ? 1 : 0.75))
      .attr("stroke", (d) => (d.isCenter ? "#fff" : "none"))
      .attr("stroke-width", 2)

    node
      .append("text")
      .text((d) => d.reference)
      .attr("text-anchor", "middle")
      .attr("dy", "3em")
      .attr("font-size", "10px")
      .attr("fill", "#8888aa")
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
  }, [centerNode, connections])

  if (connections.length === 0) {
    return (
      <div
        className="rounded-xl border flex items-center justify-center h-64"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
      >
        <p className="text-sm">Aucune connexion disponible pour ce texte.</p>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl border overflow-hidden relative"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="absolute top-2 right-3 text-xs" style={{ color: "var(--color-text-muted)", zIndex: 10 }}>
        Scroll pour zoomer · Drag pour déplacer
      </div>
      <svg ref={svgRef} className="w-full" style={{ height: "clamp(280px, 55vw, 420px)" }} />
      <div className="flex gap-4 px-4 py-3 border-t flex-wrap" style={{ borderColor: "var(--color-border)" }}>
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span className="text-xs capitalize" style={{ color: "var(--color-text-muted)" }}>{type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
