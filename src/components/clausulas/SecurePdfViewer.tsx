'use client';

import { useEffect, useRef, useState } from 'react';

const PDF_SRC = '/Clausulas_membrete_2026_final.pdf';
const VIEWER_MAX_WIDTH = 1160;
const DOCUMENT_MAX_WIDTH = 900;
const DOCUMENT_WIDTH_RATIO = 0.87;
const PDF_RENDER_SCALE = 2.0;
const CONTENT_WIDTH_RATIO = 0.98;
const CONTENT_HEIGHT_RATIO = 0.97;

type ContentBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type PdfPage = {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  render: (options: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
  }) => { promise: Promise<void>; cancel: () => void };
};

type PdfDocument = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPage>;
  destroy: () => Promise<void>;
};

function getContentBounds(canvas: HTMLCanvasElement): ContentBounds {
  const { width, height } = canvas;
  const portraitWidth = Math.min(width * CONTENT_WIDTH_RATIO, height * 0.76);
  const portraitHeight = Math.min(height * CONTENT_HEIGHT_RATIO, portraitWidth * 1.42);

  return {
    x: Math.max(0, Math.round((width - portraitWidth) / 2)),
    y: Math.max(0, Math.round((height - portraitHeight) / 2)),
    width: Math.round(portraitWidth),
    height: Math.round(portraitHeight),
  };
}

export default function SecurePdfViewer() {
  const pagesRef = useRef<HTMLDivElement>(null);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const showNotice = () => {
      setNoticeVisible(true);
      window.setTimeout(() => setNoticeVisible(false), 1800);
    };

    const preventContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      showNotice();
    };

    const preventShortcuts = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const blocked =
        key === 'printscreen' ||
        ((event.ctrlKey || event.metaKey) && ['s', 'p', 'u'].includes(key)) ||
        ((event.ctrlKey || event.metaKey) && event.shiftKey && ['i', 'j', 'c'].includes(key));

      if (blocked) {
        event.preventDefault();
        showNotice();
      }
    };

    window.addEventListener('contextmenu', preventContextMenu);
    window.addEventListener('keydown', preventShortcuts);

    return () => {
      window.removeEventListener('contextmenu', preventContextMenu);
      window.removeEventListener('keydown', preventShortcuts);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let activePdf: PdfDocument | null = null;
    const cleanupPagesContainer = pagesRef.current;

    const renderPdf = async () => {
      const pagesContainer = pagesRef.current;

      if (!pagesContainer) {
        return;
      }

      setIsLoading(true);
      setHasError(false);
      pagesContainer.replaceChildren();

      try {
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        const loadingTask = pdfjsLib.getDocument({ url: PDF_SRC });
        const pdf = (await loadingTask.promise) as unknown as PdfDocument;
        activePdf = pdf;

        if (cancelled) {
          await pdf.destroy();
          return;
        }

        const availableWidth = Math.min(
          DOCUMENT_MAX_WIDTH,
          Math.max(300, (pagesContainer.clientWidth - 16) * DOCUMENT_WIDTH_RATIO),
        );

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) {
            break;
          }

          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
          const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

          const pageShell = document.createElement('div');
          pageShell.className =
            'mx-auto mb-5 w-fit max-w-full overflow-hidden rounded-xl border border-border bg-white shadow-lg shadow-primary/5';

          const sourceCanvas = document.createElement('canvas');
          const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (!sourceContext || !context) {
            throw new Error('No se pudo preparar el visor del documento.');
          }

          sourceCanvas.width = Math.floor(viewport.width * pixelRatio);
          sourceCanvas.height = Math.floor(viewport.height * pixelRatio);
          sourceContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
          sourceContext.fillStyle = '#ffffff';
          sourceContext.fillRect(0, 0, viewport.width, viewport.height);

          await page.render({ canvasContext: sourceContext, viewport }).promise;

          const bounds = getContentBounds(sourceCanvas);
          const displayWidth = availableWidth;
          const displayHeight = displayWidth * (bounds.height / bounds.width);

          canvas.width = bounds.width;
          canvas.height = bounds.height;
          canvas.style.width = `${displayWidth}px`;
          canvas.style.height = `${displayHeight}px`;
          canvas.style.display = 'block';
          canvas.setAttribute('aria-label', `Página ${pageNumber}`);

          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, bounds.width, bounds.height);
          context.drawImage(
            sourceCanvas,
            bounds.x,
            bounds.y,
            bounds.width,
            bounds.height,
            0,
            0,
            bounds.width,
            bounds.height,
          );

          pageShell.style.width = `${displayWidth}px`;
          pageShell.style.maxWidth = 'none';
          pageShell.appendChild(canvas);
          pagesContainer.appendChild(pageShell);
          setIsLoading(false);
          sourceCanvas.width = 0;
          sourceCanvas.height = 0;
        }

        if (!cancelled) {
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    renderPdf();

    return () => {
      cancelled = true;
      cleanupPagesContainer?.replaceChildren();
      void activePdf?.destroy();
    };
  }, []);

  return (
    <>
      <div
        className="relative mx-auto overflow-hidden rounded-2xl border border-border bg-white shadow-2xl shadow-primary/10"
        style={{ maxWidth: `${VIEWER_MAX_WIDTH}px` }}
        onContextMenu={(event) => event.preventDefault()}
        onCopy={(event) => event.preventDefault()}
        onCut={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
      >
        <div className="flex items-center justify-between border-b border-border bg-[#3C60A2] px-4 py-3 sm:px-6">
          <p className="text-sm font-medium uppercase tracking-wide text-white">Documento oficial</p>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">2026</span>
        </div>

        <div className="h-[74vh] min-h-[480px] max-h-[840px] overflow-y-auto bg-[#f6f4f2] px-2 py-5 sm:px-4">
          {isLoading && (
            <div className="flex h-full min-h-[420px] items-center justify-center text-center">
              <div>
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                <p className="text-sm font-medium text-primary">Cargando documento...</p>
              </div>
            </div>
          )}

          {hasError && (
            <div className="flex h-full min-h-[420px] items-center justify-center text-center">
              <div className="max-w-md rounded-xl border border-primary/20 bg-white px-5 py-4 text-primary shadow-lg">
                No se pudo cargar el documento en este momento.
              </div>
            </div>
          )}

          <div
            ref={pagesRef}
            className={hasError ? 'hidden select-none' : 'mx-auto flex max-w-full select-none flex-col items-center'}
            aria-label="Cláusulas Jardines del Renacer 2026"
          />
        </div>

        {noticeVisible && (
          <div className="pointer-events-none absolute inset-x-4 top-20 mx-auto max-w-sm rounded-xl border border-primary/20 bg-white/95 px-4 py-3 text-center text-sm font-medium text-primary shadow-lg">
            Acción no disponible en esta vista.
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          body::before {
            content: 'Documento protegido';
            visibility: visible !important;
            display: flex;
            min-height: 100vh;
            align-items: center;
            justify-content: center;
            color: #3c60a2;
            font-family: Inter, Arial, sans-serif;
            font-size: 22px;
            font-weight: 600;
          }
        }
      `}</style>
    </>
  );
}
