type MarkdownViewerProps = {
  html: string
}

export function MarkdownViewer({ html }: MarkdownViewerProps) {
  return (
    <div
      class="markdown-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
