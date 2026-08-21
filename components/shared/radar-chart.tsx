"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/** 雷达图单维度数据 */
export interface RadarAxis {
  /** 维度名称（轴标签） */
  label: string;
  /** 自评熟练度（0-100） */
  value: number;
  /** 悬浮/聚焦时的维度说明（气泡第二行） */
  description: string;
}

interface RadarChartProps {
  /** 维度数据（设计为六轴，顺时针从正上方开始） */
  axes: RadarAxis[];
  /** 图表整体无障碍名称 */
  label: string;
}

/** 画布与几何常量：六边形外接圆半径 100，轴标签再外扩一圈 */
const VIEW_WIDTH = 400;
const VIEW_HEIGHT = 330;
const CENTER_X = 200;
const CENTER_Y = 170;
const RADIUS = 100;
const LABEL_RADIUS = 118;
/** 网格环层级（相对满值半径的比例） */
const GRID_LEVELS = [0.25, 0.5, 0.75, 1];

/**
 * 计算第 index 个轴上给定半径处的坐标（首轴指向正上方，顺时针均分）。
 *
 * @param index 轴序号（从 0 开始）
 * @param radius 距圆心的半径
 * @returns SVG 坐标
 */
function axisPoint(index: number, radius: number): { x: number; y: number } {
  const angle = ((-90 + index * 60) * Math.PI) / 180;
  return {
    x: CENTER_X + radius * Math.cos(angle),
    y: CENTER_Y + radius * Math.sin(angle),
  };
}

/**
 * 轴标签的水平对齐：右侧轴靠左起点，左侧轴靠右终点，上下轴居中。
 *
 * @param index 轴序号
 * @returns SVG textAnchor 值
 */
function anchorFor(index: number): "start" | "middle" | "end" {
  const cos = Math.cos(((-90 + index * 60) * Math.PI) / 180);
  return cos > 0.35 ? "start" : cos < -0.35 ? "end" : "middle";
}

/**
 * 轴标签相对坐标点的垂直偏移：顶轴上移、底轴下移、侧轴居中。
 *
 * @param index 轴序号
 * @returns 基线偏移像素
 */
function dyFor(index: number): number {
  const sin = Math.sin(((-90 + index * 60) * Math.PI) / 180);
  return sin < -0.7 ? -8 : sin > 0.7 ? 16 : 4;
}

/**
 * 六边形能力雷达图：纯 SVG 自绘，不引入图表库。
 * 视觉走克制专业风 —— 放射渐变填充 + 柔光 + 虚线网格；
 * 支持悬浮/键盘聚焦维度顶点弹出说明气泡；进入视口时
 * 数据多边形以弹簧动画展开。系统开启"减少动态效果"时全部直出。
 */
export function RadarChart({ axes, label }: RadarChartProps) {
  const gradientId = useId();
  const glowId = useId();
  const [active, setActive] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  const toPolygon = (radius: number) =>
    axes
      .map((_, i) => {
        const p = axisPoint(i, radius);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(" ");

  const dataPoints = axes.map((axis, i) => ({
    ...axisPoint(i, (Math.min(Math.max(axis.value, 0), 100) / 100) * RADIUS),
    key: axis.label,
  }));
  const dataPolygon = dataPoints
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  const activeAxis = active !== null ? axes[active] : null;
  // 气泡锚点：从激活顶点向圆心方向内移 26px，保证气泡始终落在画布内部
  const activeAnchor =
    active !== null
      ? (() => {
          const v = axisPoint(active, (axes[active].value / 100) * RADIUS);
          const dx = CENTER_X - v.x;
          const dy = CENTER_Y - v.y;
          const len = Math.hypot(dx, dy) || 1;
          return {
            x: v.x + (dx / len) * 26,
            y: v.y + (dy / len) * 26,
          };
        })()
      : null;

  return (
    <>
      <div className="relative w-full max-w-[340px]">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          role="img"
          aria-label={label}
          className="h-auto w-full"
        >
          <defs>
            {/* 数据区放射渐变：中心浓、边缘淡，产生体积感 */}
            <radialGradient
              id={gradientId}
              gradientUnits="userSpaceOnUse"
              cx={CENTER_X}
              cy={CENTER_Y}
              r={RADIUS}
            >
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.06" />
            </radialGradient>
            {/* 柔光滤镜：垫在数据多边形下方的一层品牌色光晕 */}
            <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          {/* 网格环与轴线：内环虚线、外环实线 */}
          <motion.g
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            {GRID_LEVELS.map((level) => (
              <polygon
                key={level}
                points={toPolygon(RADIUS * level)}
                fill="none"
                strokeWidth={1}
                strokeDasharray={level === 1 ? undefined : "3 4"}
                className={level === 1 ? "stroke-border" : "stroke-border/50"}
              />
            ))}
            {axes.map((axis, i) => {
              const p = axisPoint(i, RADIUS);
              return (
                <line
                  key={axis.label}
                  x1={CENTER_X}
                  y1={CENTER_Y}
                  x2={p.x}
                  y2={p.y}
                  strokeWidth={1}
                  className={`transition-colors duration-150 ${
                    active === i ? "stroke-primary/50" : "stroke-border/40"
                  }`}
                />
              );
            })}
          </motion.g>

          {/* 数据多边形：柔光垫底 + 渐变主体，弹簧展开 */}
          <motion.g
            initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 120, damping: 14, delay: 0.15 }
            }
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            <polygon
              points={dataPolygon}
              fill="var(--primary)"
              opacity={0.15}
              filter={`url(#${glowId})`}
            />
            <polygon
              points={dataPolygon}
              strokeWidth={2}
              strokeLinejoin="round"
              className="stroke-primary"
              style={{ fill: `url(#${gradientId})` }}
            />
          </motion.g>

          {/* 顶点圆点：错落弹入；激活时放大 */}
          {dataPoints.map((p, i) => (
            <motion.circle
              key={p.key}
              cx={p.x}
              cy={p.y}
              r={active === i ? 5.5 : 3.5}
              strokeWidth={2}
              className="fill-primary stroke-background transition-all duration-150"
              initial={reduceMotion ? false : { opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 260,
                      damping: 18,
                      delay: 0.35 + i * 0.07,
                    }
              }
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            />
          ))}

          {/* 轴标签（名称 + 分值），激活维度整行强调 */}
          <motion.g
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            {axes.map((axis, i) => {
              const p = axisPoint(i, LABEL_RADIUS);
              return (
                <text
                  key={axis.label}
                  x={p.x}
                  y={p.y + dyFor(i)}
                  textAnchor={anchorFor(i)}
                  className={`text-[11px] transition-all duration-150 ${
                    active === i
                      ? "fill-foreground font-semibold"
                      : "fill-muted-foreground"
                  }`}
                >
                  {axis.label}{" "}
                  <tspan className="fill-primary font-semibold">
                    {axis.value}
                  </tspan>
                </text>
              );
            })}
          </motion.g>

          {/* 透明命中区：悬浮/键盘聚焦/点击（触屏）激活对应维度 */}
          {dataPoints.map((p, i) => (
            <circle
              key={`hit-${p.key}`}
              cx={p.x}
              cy={p.y}
              r={14}
              fill="transparent"
              tabIndex={0}
              role="graphics-symbol"
              aria-label={`${axes[i].label}：${axes[i].value} 分，${axes[i].description}`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(i)}
            />
          ))}
        </svg>

        {/* 维度说明气泡（HTML overlay，百分比定位随 viewBox 缩放） */}
        {activeAxis && activeAnchor ? (
          <motion.div
            key={activeAxis.label}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute z-10 w-max max-w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-popover px-3 py-2 text-left shadow-md"
            style={{
              left: `${(activeAnchor.x / VIEW_WIDTH) * 100}%`,
              top: `${(activeAnchor.y / VIEW_HEIGHT) * 100}%`,
            }}
          >
            <p className="text-xs font-semibold text-foreground">
              {activeAxis.label} · {activeAxis.value}/100
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
              {activeAxis.description}
            </p>
          </motion.div>
        ) : null}
      </div>
      {/* 屏幕阅读器数据源（视觉隐藏） */}
      <ul className="sr-only">
        {axes.map((axis) => (
          <li key={axis.label}>
            {axis.label}：{axis.value} / 100
          </li>
        ))}
      </ul>
    </>
  );
}
