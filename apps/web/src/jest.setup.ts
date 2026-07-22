import "@testing-library/jest-dom"

window.HTMLMediaElement.prototype.play = jest.fn().mockImplementation(() => Promise.resolve())
window.HTMLMediaElement.prototype.pause = jest.fn()
window.HTMLMediaElement.prototype.load = jest.fn()

if (!global.fetch) {
  global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ hadiths: [] }),
    }),
  ) as unknown as typeof fetch
}
