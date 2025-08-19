import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from 'react-toastify';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  MagnifyingGlassPlusIcon, 
  MagnifyingGlassMinusIcon 
} from '@heroicons/react/24/outline';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const PDFViewer = ({ pdfUrl, onError, showLoader = true }) => {
  const canvasRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [isRendering, setIsRendering] = useState(false);
  const currentRenderTask = useRef(null);
  const pdfUrlRef = useRef(pdfUrl);

  // Update ref when pdfUrl changes
  useEffect(() => {
    pdfUrlRef.current = pdfUrl;
  }, [pdfUrl]);

  // Render page function - simplified and optimized
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderPage = useCallback(async (pdf, pageNum, renderScale) => {
    // Cancel any ongoing render task
    if (currentRenderTask.current) {
      currentRenderTask.current.cancel();
      currentRenderTask.current = null;
    }

    // Prevent multiple simultaneous renders
    if (isRendering) {
      return;
    }

    try {
      setIsRendering(true);
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      
      if (!canvas) {
        return;
      }
      
      const context = canvas.getContext('2d');
      if (!context) {
        return;
      }

      // Calculate viewport with the provided scale
      const viewport = page.getViewport({ scale: renderScale });
      
      // Set canvas dimensions
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render the page
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      currentRenderTask.current = page.render(renderContext);
      await currentRenderTask.current.promise;
    } catch (error) {
      if (error.name !== 'RenderingCancelled') {
        console.error('Error rendering page:', error);
        toast.error('Failed to render PDF page');
      }
    } finally {
      setIsRendering(false);
      currentRenderTask.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load PDF document
  useEffect(() => {
    if (!pdfUrl) return;

    let loadingTask = null;
    let isMounted = true;

    const loadPDF = async () => {
      try {
        setLoading(true);
        
        // Load the PDF document
        loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        if (isMounted) {
          setPdfDocument(pdf);
          setTotalPages(pdf.numPages);
          setCurrentPage(1);
          setScale(1.0);
        }
        
      } catch (error) {
        if (isMounted) {
          console.error('Error loading PDF:', error);
          toast.error('Failed to load PDF preview');
          if (onError) onError(error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPDF();

    // Cleanup function
    return () => {
      isMounted = false;
      if (loadingTask) {
        loadingTask.destroy();
      }
    };
  }, [pdfUrl, onError]);

  // Render page when document, page, or scale changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (pdfDocument && canvasRef.current && !isRendering) {
      renderPage(pdfDocument, currentPage, scale);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDocument, currentPage, scale, renderPage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pdfDocument) {
        pdfDocument.destroy();
      }
      if (currentRenderTask.current) {
        currentRenderTask.current.cancel();
      }
    };
  }, [pdfDocument]);

  // Navigation functions
  const changePage = useCallback((newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  }, [totalPages]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const changeScale = useCallback((newScale) => {
    if (newScale < 0.5 || newScale > 3.0) return;
    setScale(newScale);
  }, []);

  const nextPage = useCallback(() => changePage(currentPage + 1), [changePage, currentPage]);
  const prevPage = useCallback(() => changePage(currentPage - 1), [changePage, currentPage]);
  const zoomIn = useCallback(() => changeScale(scale + 0.25), [changeScale, scale]);
  const zoomOut = useCallback(() => changeScale(scale - 0.25), [changeScale, scale]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          prevPage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextPage();
          break;
        case '+':
        case '=':
          event.preventDefault();
          zoomIn();
          break;
        case '-':
          event.preventDefault();
          zoomOut();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [prevPage, nextPage, zoomIn, zoomOut]);

  if (loading && showLoader) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (loading && !showLoader) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
             {/* PDF Controls */}
       <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 p-4 flex items-center justify-between flex-wrap gap-3">
         {/* Mobile: Centered page navigation */}
         <div className="flex md:hidden items-center justify-center w-full">
           <div className="flex items-center gap-3">
             <button
               onClick={prevPage}
               disabled={currentPage <= 1}
               className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors duration-200 shadow-sm"
               title="Previous page (←)"
             >
               <ChevronLeftIcon className="w-4 h-4" />
             </button>
             
             <span className="text-sm font-medium text-gray-700 bg-white px-3 py-2 rounded-lg shadow-sm">
               Page {currentPage} of {totalPages}
             </span>
             
             <button
               onClick={nextPage}
               disabled={currentPage >= totalPages}
               className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors duration-200 shadow-sm"
               title="Next page (→)"
             >
               <ChevronRightIcon className="w-4 h-4" />
             </button>
           </div>
         </div>

         {/* Desktop: Left-aligned page navigation */}
         <div className="hidden md:flex items-center gap-3">
           <button
             onClick={prevPage}
             disabled={currentPage <= 1}
             className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors duration-200 shadow-sm"
             title="Previous page (←)"
           >
             <ChevronLeftIcon className="w-4 h-4" />
           </button>
           
           <span className="text-sm font-medium text-gray-700 bg-white px-3 py-2 rounded-lg shadow-sm">
             Page {currentPage} of {totalPages}
           </span>
           
           <button
             onClick={nextPage}
             disabled={currentPage >= totalPages}
             className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors duration-200 shadow-sm"
             title="Next page (→)"
           >
             <ChevronRightIcon className="w-4 h-4" />
           </button>
         </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors duration-200 shadow-sm"
            title="Zoom out (-)"
          >
            <MagnifyingGlassMinusIcon className="w-4 h-4" />
          </button>
          
          <span className="text-sm font-medium text-gray-700 bg-white px-3 py-2 rounded-lg shadow-sm min-w-[70px] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={zoomIn}
            disabled={scale >= 3.0}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors duration-200 shadow-sm"
            title="Zoom in (+)"
          >
            <MagnifyingGlassPlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Canvas Container */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="flex justify-center items-center min-h-full">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
            <canvas
              ref={canvasRef}
              className="block"
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                display: 'block'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
