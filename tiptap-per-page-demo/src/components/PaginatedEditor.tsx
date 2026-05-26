import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { PaginationPlus } from 'tiptap-pagination-plus'
import { useEffect, useRef } from 'react'

type PaginatedEditorProps = {
  initialContent: string
  targetPage: number
  headerLeft: string
  headerRight: string
  footerLeft: string
  footerRight: string
  onHeaderClick: (params: { pageNumber: number }) => void
  onFooterClick: (params: { pageNumber: number }) => void
  onAction: (message: string) => void
}

export function PaginatedEditor({
  initialContent,
  targetPage,
  headerLeft,
  headerRight,
  footerLeft,
  footerRight,
  onHeaderClick,
  onFooterClick,
  onAction,
}: PaginatedEditorProps) {
  const propsRef = useRef({
    targetPage,
    headerLeft,
    headerRight,
    footerLeft,
    footerRight,
    onHeaderClick,
    onFooterClick,
    onAction,
  })
  propsRef.current = {
    targetPage,
    headerLeft,
    headerRight,
    footerLeft,
    footerRight,
    onHeaderClick,
    onFooterClick,
    onAction,
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      PaginationPlus.configure({
        pageHeight: 800,
        pageWidth: 789,
        pageGap: 50,
        pageGapBorderSize: 1,
        pageGapBorderColor: '#e5e5e5',
        pageBreakBackground: '#f4f4f5',
        headerLeft: '<strong>Default Header</strong>',
        headerRight: 'Page {page}',
        footerLeft: 'Default Footer',
        footerRight: 'Page {page}',
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 50,
        marginRight: 50,
        contentMarginTop: 10,
        contentMarginBottom: 10,
        customHeader: {
          2: {
            headerLeft: 'Chapter 2',
            headerRight: 'Page {page}',
          },
        },
        customFooter: {
          3: {
            footerLeft: 'Special Footer',
            footerRight: 'Page {page}',
          },
        },
        onHeaderClick: ({ pageNumber }) => {
          propsRef.current.onHeaderClick({ pageNumber })
        },
        onFooterClick: ({ pageNumber }) => {
          propsRef.current.onFooterClick({ pageNumber })
        },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'paginated-prose',
      },
    },
  })

  useEffect(() => {
    const root = document.querySelector('.app')
    if (!root || !editor) return

    const onClick = (event: Event) => {
      const target = event.target as HTMLElement
      const action = target.closest('[data-action]')?.getAttribute('data-action')
      if (!action) return

      const {
        targetPage: page,
        headerLeft: hLeft,
        headerRight: hRight,
        footerLeft: fLeft,
        footerRight: fRight,
        onAction: log,
      } = propsRef.current

      if (action === 'update-header') {
        editor
          .chain()
          .focus()
          .updateHeaderContent(hLeft, hRight, page)
          .run()
        log(`Updated header on page ${page}`)
      }

      if (action === 'update-footer') {
        editor
          .chain()
          .focus()
          .updateFooterContent(fLeft, fRight, page)
          .run()
        log(`Updated footer on page ${page}`)
      }
    }

    root.addEventListener('click', onClick)
    return () => root.removeEventListener('click', onClick)
  }, [editor])

  return (
    <div className="paginated-editor">
      <EditorContent editor={editor} />
    </div>
  )
}
