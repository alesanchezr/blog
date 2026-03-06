import { useState, useEffect } from 'preact/hooks'
import { marked } from 'marked'
import { MarkdownViewer } from './components/MarkdownViewer'
import { Breadcrumb } from './components/Breadcrumb'
import { ThemeToggle } from './components/ThemeToggle'
import './app.css'

function pathToContentUrl(pathname: string): string {
  const path = pathname.replace(/^\//, '').trim()
  if (!path || path === 'home') return '/content/home.md'
  return `/content/${path}.md`
}

function isHtmlResponse(text: string): boolean {
  const trimmed = text.trimStart().toLowerCase()
  return trimmed.startsWith('<!doctype') || trimmed.startsWith('<html')
}

function externalLinksNewTab(html: string): string {
  return html.replace(
    /<a href="(https?:\/\/[^"]*)"/gi,
    '<a href="$1" target="_blank" rel="noopener noreferrer"'
  )
}

export function App() {
  const [pathname, setPathname] = useState(
    () => (typeof window !== 'undefined' ? window.location.pathname : '/')
  )
  const contentUrl = pathToContentUrl(pathname)
  const [html, setHtml] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path)
    setPathname(path)
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(contentUrl)
      .then(async (res) => {
        if (res.status === 404) {
          const notFoundRes = await fetch('/content/404.md')
          if (!notFoundRes.ok) throw new Error('Not found')
          return notFoundRes.text()
        }
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`)
        const text = await res.text()
        if (isHtmlResponse(text)) {
          const notFoundRes = await fetch('/content/404.md')
          if (!notFoundRes.ok) throw new Error('Not found')
          return notFoundRes.text()
        }
        return text
      })
      .then((text) => {
        if (cancelled) return
        const result = marked(text)
        return result instanceof Promise ? result : Promise.resolve(result)
      })
      .then((rendered) => {
        if (cancelled) return
        const htmlStr = typeof rendered === 'string' ? rendered : ''
        setHtml(externalLinksNewTab(htmlStr))
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [contentUrl])

  if (loading) {
    return (
      <>
        <ThemeToggle />
        <Breadcrumb pathname={pathname} onNavigate={handleNavigate} />
        <div class="state state-loading">Loading…</div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <ThemeToggle />
        <Breadcrumb pathname={pathname} onNavigate={handleNavigate} />
        <div class="state state-error">{error}</div>
      </>
    )
  }

  return (
    <>
      <ThemeToggle />
      <Breadcrumb pathname={pathname} onNavigate={handleNavigate} />
      <MarkdownViewer html={html} />
    </>
  )
}
