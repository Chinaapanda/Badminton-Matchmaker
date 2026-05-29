# TipTap Per-Page Header/Footer Demo

Interactive demo for [Tiptap Plus — per-page customization](https://tiptapplus.com/pagination-plus/header-footer/per-page-customization/).

## Features

- Default header/footer on all pages
- **Page 2**: custom header via `customHeader`
- **Page 3**: custom footer via `customFooter`
- Runtime updates with `updateHeaderContent(left, right, pageNumber)` and `updateFooterContent(left, right, pageNumber)`
- Click callbacks on headers and footers

## Run locally (desktop)

```bash
cd tiptap-per-page-demo
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```
