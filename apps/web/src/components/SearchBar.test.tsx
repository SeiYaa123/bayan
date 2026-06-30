import { render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import SearchBar from "./SearchBar"

const noop = () => {}

function setup(props: Partial<Parameters<typeof SearchBar>[0]> = {}) {
  const onSearch = jest.fn()
  const utils = render(
    <SearchBar onSearch={onSearch} loading={false} {...props} />,
  )
  const input = screen.getByPlaceholderText(/Rechercher/i)
  return { onSearch, input, ...utils }
}

beforeEach(() => {
  localStorage.clear()
})

describe("SearchBar", () => {
  test("renders input with placeholder", () => {
    setup()
    expect(screen.getByPlaceholderText(/Rechercher/i)).toBeInTheDocument()
  })

  test("calls onSearch with trimmed value on Enter", async () => {
    const { onSearch, input } = setup()
    await userEvent.type(input, "  رحمة  {enter}")
    expect(onSearch).toHaveBeenCalledWith("رحمة")
  })

  test("does not call onSearch when value is blank", async () => {
    const { onSearch, input } = setup()
    await userEvent.type(input, "   {enter}")
    expect(onSearch).not.toHaveBeenCalled()
  })

  test("calls onSearch on Chercher button click", async () => {
    const { onSearch, input } = setup()
    await userEvent.type(input, "صبر")
    fireEvent.click(screen.getByRole("button", { name: /Chercher/i }))
    expect(onSearch).toHaveBeenCalledWith("صبر")
  })

  test("Chercher button disabled when input is empty", () => {
    setup()
    expect(screen.getByRole("button", { name: /Chercher/i })).toBeDisabled()
  })

  test("Chercher button disabled while loading", async () => {
    const { input } = setup({ loading: true })
    await userEvent.type(input, "رحمة")
    expect(screen.getByRole("button", { name: /…/i })).toBeDisabled()
  })

  test("clear button appears after typing and clears input", async () => {
    const { input } = setup()
    await userEvent.type(input, "رحمة")
    const clear = screen.getByRole("button", { name: /Effacer/i })
    expect(clear).toBeInTheDocument()
    await userEvent.click(clear)
    expect(input).toHaveValue("")
  })

  test("initialValue populates the input", () => {
    const { input } = setup({ initialValue: "جهاد" })
    expect(input).toHaveValue("جهاد")
  })

  test("shows history dropdown when focused with empty field and history exists", async () => {
    localStorage.setItem(
      "bayan:search_history",
      JSON.stringify(["رحمة", "صبر"]),
    )
    const { input } = setup()
    await userEvent.clear(input)
    fireEvent.focus(input)
    expect(screen.getByText("Recherches récentes")).toBeInTheDocument()
    expect(screen.getByText("رحمة")).toBeInTheDocument()
  })

  test("Escape closes history dropdown and blurs input", async () => {
    localStorage.setItem("bayan:search_history", JSON.stringify(["رحمة"]))
    const { input } = setup()
    await userEvent.clear(input)
    fireEvent.focus(input)
    expect(screen.getByText("رحمة")).toBeInTheDocument()
    await userEvent.keyboard("{Escape}")
    expect(screen.queryByText("Recherches récentes")).not.toBeInTheDocument()
  })
})
