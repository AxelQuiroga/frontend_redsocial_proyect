import { useState, useRef, useCallback, useEffect } from "react";

interface ImageEditorModalProps {
  file: File;
  onApply: (editedFile: File) => void;
  onCancel: () => void;
}

interface Filters {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
}

const DEFAULT_FILTERS: Filters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
};

/** Editor de imágenes con crop 16:9 y filtros básicos. */
export function ImageEditorModal({ file, onApply, onCancel }: ImageEditorModalProps) {
  const [objectUrl, setObjectUrl] = useState("");
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const dragRef = useRef({ startX: 0, startY: 0, offX: 0, offY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Crear object URL al montar, limpiar al desmontar
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Calcular zoom inicial cuando se carga la imagen
  const handleImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      const natW = img.naturalWidth;
      const natH = img.naturalHeight;
      setImgNatural({ w: natW, h: natH });

      if (containerRef.current) {
        const cw = containerRef.current.clientWidth;
        const ch = containerRef.current.clientHeight;
        setZoom(Math.min(cw / natW, ch / natH));
        setOffset({ x: 0, y: 0 });
      }
      setLoaded(true);
    },
    []
  );

  // ─── Pan (arrastrar imagen) ───────────────────────
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      dragRef.current = { startX: e.clientX, startY: e.clientY, offX: offset.x, offY: offset.y };
    },
    [offset]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setOffset({
        x: dragRef.current.offX + (e.clientX - dragRef.current.startX),
        y: dragRef.current.offY + (e.clientY - dragRef.current.startY),
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  // ─── Zoom ──────────────────────────────────────────
  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(Math.max(0.1, Math.min(5, newZoom)));
  }, []);

  const zoomToFit = useCallback(() => {
    if (!containerRef.current || !imgNatural.w) return;
    const { clientWidth: cw, clientHeight: ch } = containerRef.current;
    setZoom(Math.min(cw / imgNatural.w, ch / imgNatural.h));
    setOffset({ x: 0, y: 0 });
  }, [imgNatural]);

  const zoomToFill = useCallback(() => {
    if (!containerRef.current || !imgNatural.w) return;
    const { clientWidth: cw, clientHeight: ch } = containerRef.current;
    setZoom(Math.max(cw / imgNatural.w, ch / imgNatural.h));
    setOffset({ x: 0, y: 0 });
  }, [imgNatural]);

  // ─── Filtros ──────────────────────────────────────
  const handleFilterChange = useCallback((key: keyof Filters, value: number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // ─── Apply: render canvas con crop + filtros ──────
  const filterStyle = [
    `brightness(${filters.brightness}%)`,
    `contrast(${filters.contrast}%)`,
    `saturate(${filters.saturation}%)`,
    filters.grayscale > 0 ? `grayscale(${filters.grayscale}%)` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleApply = useCallback(() => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container || !imgNatural.w) return;

    const OUTPUT_W = 1600;
    const OUTPUT_H = 900;

    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    // Región visible de la imagen dentro del contenedor
    const visibleLeft = Math.max(imgRect.left, containerRect.left);
    const visibleTop = Math.max(imgRect.top, containerRect.top);
    const visibleRight = Math.min(imgRect.right, containerRect.right);
    const visibleBottom = Math.min(imgRect.bottom, containerRect.bottom);

    if (visibleRight <= visibleLeft || visibleBottom <= visibleTop) return;

    // Mapear a coordenadas de la imagen original
    const scaleX = imgNatural.w / imgRect.width;
    const scaleY = imgNatural.h / imgRect.height;

    const sx = (visibleLeft - imgRect.left) * scaleX;
    const sy = (visibleTop - imgRect.top) * scaleY;
    const sw = (visibleRight - visibleLeft) * scaleX;
    const sh = (visibleBottom - visibleTop) * scaleY;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_W;
    canvas.height = OUTPUT_H;
    const ctx = canvas.getContext("2d")!;

    ctx.filter = filterStyle;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, OUTPUT_W, OUTPUT_H);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
        const editedFile = new File([blob], name, { type: "image/jpeg" });
        onApply(editedFile);
      },
      "image/jpeg",
      0.92
    );
  }, [imgNatural, filterStyle, file.name, onApply]);

  // Posición de la imagen (centrada + offset)
  const cw = containerRef.current?.clientWidth ?? 600;
  const ch = containerRef.current?.clientHeight ?? 338;
  const imgDisplayW = imgNatural.w * zoom;
  const imgDisplayH = imgNatural.h * zoom;
  const imgLeft = (cw - imgDisplayW) / 2 + offset.x;
  const imgTop = (ch - imgDisplayH) / 2 + offset.y;

  return (
    <div
      className="image-editor-overlay"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="image-editor-modal">
        {/* ─── Header ─── */}
        <div className="image-editor-header">
          <h3 className="image-editor-title">Editar imagen</h3>
          <button
            type="button"
            className="image-editor-close"
            onClick={onCancel}
            aria-label="Cerrar editor"
          >
            ✕
          </button>
        </div>

        {/* ─── Body ─── */}
        <div className="image-editor-body">
          {/* Área de crop 16:9 */}
          <div className="image-editor-crop-area" ref={containerRef}>
            {objectUrl && (
              <img
                ref={imgRef}
                src={objectUrl}
                alt=""
                onLoad={handleImageLoad}
                className="image-editor-img"
                style={{
                  left: `${imgLeft}px`,
                  top: `${imgTop}px`,
                  width: `${imgDisplayW}px`,
                  height: `${imgDisplayH}px`,
                  cursor: isDragging ? "grabbing" : "grab",
                  filter: filterStyle,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                draggable={false}
              />
            )}

            {/* Guías de crop */}
            <div className="image-editor-crop-guides" aria-hidden>
              <div className="image-editor-crop-guide-h" />
              <div className="image-editor-crop-guide-v" />
            </div>

            <div className="image-editor-aspect-label" aria-hidden>
              16:9
            </div>

            {!loaded && (
              <div className="image-editor-loading">Cargando imagen...</div>
            )}
          </div>

          {/* Controles */}
          <div className="image-editor-controls">
            {/* Zoom */}
            <div className="image-editor-control-group">
              <label className="image-editor-control-label">Zoom</label>
              <div className="image-editor-zoom-row">
                <button
                  type="button"
                  className="image-editor-btn-icon"
                  onClick={zoomToFit}
                  title="Ajustar al contenedor"
                >
                  ⛶
                </button>
                <input
                  type="range"
                  min={10}
                  max={300}
                  value={Math.round(zoom * 100)}
                  onChange={(e) => handleZoomChange(Number(e.target.value) / 100)}
                  className="image-editor-slider"
                />
                <button
                  type="button"
                  className="image-editor-btn-icon"
                  onClick={zoomToFill}
                  title="Llenar contenedor"
                >
                  ⤢
                </button>
                <span className="image-editor-zoom-value">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
            </div>

            {/* Filtros */}
            <div className="image-editor-control-group">
              <div className="image-editor-control-header">
                <label className="image-editor-control-label">Filtros</label>
                <button
                  type="button"
                  className="image-editor-btn-text"
                  onClick={resetFilters}
                >
                  Reset
                </button>
              </div>

              <FilterSlider
                label="Brillo"
                value={filters.brightness}
                min={0}
                max={200}
                onChange={(v) => handleFilterChange("brightness", v)}
              />
              <FilterSlider
                label="Contraste"
                value={filters.contrast}
                min={0}
                max={200}
                onChange={(v) => handleFilterChange("contrast", v)}
              />
              <FilterSlider
                label="Saturación"
                value={filters.saturation}
                min={0}
                max={200}
                onChange={(v) => handleFilterChange("saturation", v)}
              />
              <FilterSlider
                label="Grises"
                value={filters.grayscale}
                min={0}
                max={100}
                onChange={(v) => handleFilterChange("grayscale", v)}
              />
            </div>

            {/* Info de resolución */}
            <div className="image-editor-info">
              Salida: 1600 × 900px (JPEG)
            </div>
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div className="image-editor-footer">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleApply}
            disabled={!loaded}
          >
            Aplicar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-componente: slider de filtro ─────────────
function FilterSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="image-editor-filter-row">
      <span className="image-editor-filter-label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="image-editor-slider"
      />
      <span className="image-editor-filter-value">{value}%</span>
    </div>
  );
}
