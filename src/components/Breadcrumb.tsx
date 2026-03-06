type BreadcrumbProps = {
  pathname: string
  onNavigate: (path: string) => void
}

function segmentToLabel(segment: string): string {
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

export function Breadcrumb({ pathname, onNavigate }: BreadcrumbProps) {
  const path = pathname.replace(/^\//, '').trim()
  if (!path || path === 'home') return null

  const segments = path.split('/').filter(Boolean)
  if (segments.length === 0) return null

  const items: { href: string; label: string }[] = [
    { href: '/', label: 'Home' },
    ...segments.map((seg, i) => ({
      href: '/' + segments.slice(0, i + 1).join('/'),
      label: segmentToLabel(seg),
    })),
  ]

  const handleClick = (e: Event, href: string) => {
    e.preventDefault()
    onNavigate(href)
  }

  return (
    <nav class="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={item.href} class="breadcrumb__item">
          {i > 0 && <span class="breadcrumb__sep"> → </span>}
          {i === items.length - 1 ? (
            <span class="breadcrumb__current">{item.label}</span>
          ) : (
            <a
              href={item.href}
              class="breadcrumb__link"
              onClick={(e) => handleClick(e, item.href)}
            >
              {item.label}
            </a>
          )}
        </span>
      ))}
    </nav>
  )
}
