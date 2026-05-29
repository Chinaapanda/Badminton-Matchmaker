import { useCallback, useState } from 'react'
import { PaginatedEditor } from './components/PaginatedEditor'
import './App.css'

const SAMPLE_CONTENT = `
<h2>Per-page header &amp; footer demo</h2>
<p>This document uses <strong>tiptap-pagination-plus</strong> with different headers and footers on specific pages.</p>
<p><strong>Page 1</strong> uses the default header and footer.</p>
<p><strong>Page 2</strong> shows a custom header: &quot;Chapter 2&quot; (configured via <code>customHeader</code>).</p>
<p><strong>Page 3</strong> shows a custom footer: &quot;Special Footer&quot; (configured via <code>customFooter</code>).</p>
<p>Add more paragraphs here to grow the document and see pagination split content across pages automatically.</p>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
<p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
<p>Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra.</p>
<p>Est erat bibendum elit, non gravida neque convallis a. Cras semper auctor neque, vitae tempus quam.</p>
<p>Enim nec dui. Nunc condimentum interdum velit eu placerat. In hac habitasse platea dictumst.</p>
`.trim()

export default function App() {
  const [targetPage, setTargetPage] = useState(2)
  const [headerLeft, setHeaderLeft] = useState('Chapter 2')
  const [headerRight, setHeaderRight] = useState('Page {page}')
  const [footerLeft, setFooterLeft] = useState('Special Footer')
  const [footerRight, setFooterRight] = useState('Page {page}')
  const [lastAction, setLastAction] = useState<string | null>(null)

  const onHeaderClick = useCallback(({ pageNumber }: { pageNumber: number }) => {
    setLastAction(`Header clicked on page ${pageNumber}`)
  }, [])

  const onFooterClick = useCallback(({ pageNumber }: { pageNumber: number }) => {
    setLastAction(`Footer clicked on page ${pageNumber}`)
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Per-page header / footer</h1>
          <p className="subtitle">
            Demo based on{' '}
            <a
              href="https://tiptapplus.com/pagination-plus/header-footer/per-page-customization/"
              target="_blank"
              rel="noreferrer"
            >
              Tiptap Plus — per-page customization
            </a>
          </p>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <section className="panel">
            <h2>Built-in overrides</h2>
            <ul className="hint-list">
              <li>
                <strong>Page 2</strong> — custom header (Chapter 2)
              </li>
              <li>
                <strong>Page 3</strong> — custom footer (Special Footer)
              </li>
              <li>Click any header or footer in the editor to log an event</li>
            </ul>
          </section>

          <section className="panel">
            <h2>Runtime: update header</h2>
            <label>
              Page number
              <input
                type="number"
                min={1}
                value={targetPage}
                onChange={(e) => setTargetPage(Number(e.target.value) || 1)}
              />
            </label>
            <label>
              Header left (HTML)
              <input
                value={headerLeft}
                onChange={(e) => setHeaderLeft(e.target.value)}
              />
            </label>
            <label>
              Header right
              <input
                value={headerRight}
                onChange={(e) => setHeaderRight(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="btn primary"
              data-action="update-header"
            >
              Apply header to page {targetPage}
            </button>
          </section>

          <section className="panel">
            <h2>Runtime: update footer</h2>
            <label>
              Footer left
              <input
                value={footerLeft}
                onChange={(e) => setFooterLeft(e.target.value)}
              />
            </label>
            <label>
              Footer right
              <input
                value={footerRight}
                onChange={(e) => setFooterRight(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="btn"
              data-action="update-footer"
            >
              Apply footer to page {targetPage}
            </button>
          </section>

          {lastAction && (
            <p className="action-log" role="status">
              {lastAction}
            </p>
          )}
        </aside>

        <main className="editor-wrap">
          <PaginatedEditor
            initialContent={SAMPLE_CONTENT}
            targetPage={targetPage}
            headerLeft={headerLeft}
            headerRight={headerRight}
            footerLeft={footerLeft}
            footerRight={footerRight}
            onHeaderClick={onHeaderClick}
            onFooterClick={onFooterClick}
            onAction={setLastAction}
          />
        </main>
      </div>
    </div>
  )
}
