'use client'
import { useRef, useState, useMemo, useEffect, useCallback } from 'react'
import { PenTool, Highlighter, Eraser, Undo, Trash, Pointer } from '@/components/ui'

const WB_COLORS = ['#14130F', '#2747E0', '#C24A3A', '#1F7A47', '#B47A00', '#6B2E84']

type Point = { x: number; y: number }
type TextStroke = { type: 'text'; x: number; y: number; text: string; size: number; color: string; weight: number }
type PathStroke = { type: 'path'; tool: 'pen' | 'highlighter' | 'eraser'; color: string; size: number; pts: Point[] }
type Stroke = TextStroke | PathStroke

const lineSeg = (x1: number, y1: number, x2: number, y2: number): Point[] => [
  { x: x1, y: y1 },
  { x: x2, y: y2 },
]

interface WhiteboardProps {
  role?: string
}

export function Whiteboard({ role }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const drawing = useRef(false)
  const cur = useRef<PathStroke | null>(null)
  const [tool, setTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen')
  const [color, setColor] = useState('#2747E0')

  const seed = useMemo<Stroke[]>(() => ([
    { type: 'text', x: 0.30, y: 0.16, text: 'Mixed Conditionals', size: 34, color: '#14130F', weight: 700 },
    { type: 'path', tool: 'pen', color: '#C24A3A', size: 3, pts: lineSeg(0.30, 0.205, 0.70, 0.205) },
    { type: 'text', x: 0.16, y: 0.40, text: 'PAST', size: 16, color: '#6E6A60', weight: 700 },
    { type: 'text', x: 0.74, y: 0.40, text: 'NOW', size: 16, color: '#6E6A60', weight: 700 },
    { type: 'path', tool: 'pen', color: '#14130F', size: 2.5, pts: lineSeg(0.16, 0.46, 0.84, 0.46) },
    { type: 'path', tool: 'pen', color: '#14130F', size: 2.5, pts: [{ x: 0.20, y: 0.43 }, { x: 0.20, y: 0.49 }] },
    { type: 'path', tool: 'pen', color: '#14130F', size: 2.5, pts: [{ x: 0.80, y: 0.43 }, { x: 0.80, y: 0.49 }] },
    { type: 'text', x: 0.135, y: 0.585, text: 'if she had taken the job', size: 17, color: '#2747E0', weight: 500 },
    { type: 'text', x: 0.56, y: 0.585, text: 'she would be in Lisbon', size: 17, color: '#1F7A47', weight: 500 },
    { type: 'path', tool: 'pen', color: '#B47A00', size: 2.5, pts: [{ x: 0.40, y: 0.62 }, { x: 0.58, y: 0.62 }] },
    { type: 'path', tool: 'pen', color: '#B47A00', size: 2.5, pts: [{ x: 0.58, y: 0.62 }, { x: 0.545, y: 0.60 }] },
    { type: 'path', tool: 'pen', color: '#B47A00', size: 2.5, pts: [{ x: 0.58, y: 0.62 }, { x: 0.545, y: 0.64 }] },
    { type: 'text', x: 0.30, y: 0.78, text: 'past cause  →  present result', size: 15, color: '#6E6A60', weight: 400 },
  ]), [])

  const strokes = useRef<Stroke[]>([...seed])

  const redraw = useCallback(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const w = cv.width, h = cv.height
    const dpr = window.devicePixelRatio || 1
    ctx.clearRect(0, 0, w, h)
    const all = strokes.current
    for (const s of all) {
      if (s.type === 'text') {
        ctx.fillStyle = s.color
        ctx.font = `${s.weight || 400} ${s.size * dpr}px Geist, sans-serif`
        ctx.textBaseline = 'alphabetic'
        ctx.fillText(s.text, s.x * w, s.y * h)
      } else {
        const pts = s.pts
        if (!pts || pts.length === 0) continue
        ctx.beginPath()
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        if (s.tool === 'highlighter') {
          ctx.strokeStyle = s.color
          ctx.globalAlpha = 0.32
          ctx.lineWidth = (s.size || 14) * dpr
        } else if (s.tool === 'eraser') {
          ctx.strokeStyle = '#F6F4EE'
          ctx.globalAlpha = 1
          ctx.lineWidth = (s.size || 24) * dpr
        } else {
          ctx.strokeStyle = s.color
          ctx.globalAlpha = 1
          ctx.lineWidth = (s.size || 3) * dpr
        }
        ctx.moveTo(pts[0].x * w, pts[0].y * h)
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x * w, pts[i].y * h)
        if (pts.length === 1) ctx.lineTo(pts[0].x * w + 0.1, pts[0].y * h + 0.1)
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    }
  }, [])

  const resize = useCallback(() => {
    const cv = canvasRef.current
    const wrap = wrapRef.current
    if (!cv || !wrap) return
    const dpr = window.devicePixelRatio || 1
    const r = wrap.getBoundingClientRect()
    cv.width = r.width * dpr
    cv.height = r.height * dpr
    redraw()
  }, [redraw])

  useEffect(() => {
    resize()
    const ro = new ResizeObserver(resize)
    if (wrapRef.current) ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [resize])

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = canvasRef.current!.getBoundingClientRect()
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
  }

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true
    const size = tool === 'highlighter' ? 16 : tool === 'eraser' ? 26 : 3
    const stroke: PathStroke = { type: 'path', tool, color, size, pts: [getPos(e)] }
    cur.current = stroke
    strokes.current.push(stroke)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !cur.current) return
    cur.current.pts.push(getPos(e))
    redraw()
  }

  const up = () => {
    drawing.current = false
    cur.current = null
  }

  const undo = () => {
    strokes.current.pop()
    redraw()
  }

  const clear = () => {
    strokes.current = []
    redraw()
  }

  const tools = [
    { id: 'pen' as const, icon: PenTool, label: 'Pen' },
    { id: 'highlighter' as const, icon: Highlighter, label: 'Highlighter' },
    { id: 'eraser' as const, icon: Eraser, label: 'Eraser' },
  ]

  return (
    <div className="wb-wrap" ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className="wb-canvas"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
      />

      <div className="wb-banner">
        <PenTool size={13} color="var(--brand)" />
        {role === 'teacher' ? "You're presenting · everyone can draw" : 'Shared whiteboard · you can draw too'}
      </div>

      {/* Remote collaborator cursors */}
      <div className="wb-cursor wb-cursor-a">
        <Pointer size={16} color="#C24A3A" fill="#C24A3A" />
        <span className="lbl" style={{ background: '#C24A3A' }}>Amir</span>
      </div>
      <div className="wb-cursor wb-cursor-b">
        <Pointer size={16} color="#1F7A47" fill="#1F7A47" />
        <span className="lbl" style={{ background: '#1F7A47' }}>Yuna</span>
      </div>

      <div className="wb-toolbar">
        {tools.map(t => (
          <button
            key={t.id}
            className={`wb-tool ${tool === t.id ? 'active' : ''}`}
            title={t.label}
            onClick={() => setTool(t.id)}
          >
            <t.icon size={17} />
          </button>
        ))}
        <div className="wb-sep" />
        {WB_COLORS.map(c => (
          <button
            key={c}
            className={`wb-swatch ${color === c && tool !== 'eraser' ? 'active' : ''}`}
            style={{ background: c }}
            onClick={() => {
              setColor(c)
              if (tool === 'eraser') setTool('pen')
            }}
          />
        ))}
        <div className="wb-sep" />
        <button className="wb-tool" title="Undo" onClick={undo}><Undo size={17} /></button>
        <button className="wb-tool" title="Clear board" onClick={clear}><Trash size={17} /></button>
      </div>
    </div>
  )
}
