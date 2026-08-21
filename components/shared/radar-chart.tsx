"use client";

import { motion } from "motion/react";

/** 雷达图单维度数据 */
export interface RadarAxis {
  /** 维度名称（轴标签） */
  label: string;
  /** 自评熟练度（0-100） */
  value: number;
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
 * 颜色全部走主题变量（border / muted-foreground / primary），
 * 明暗主题自动适配；进入视口时数据多边形以缩放动效展开。
 */
export function RadarChart({ axes, label }: RadarChartProps) {
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

  return (
    <>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        role="img"
        aria-label={label}
        className="h-auto w-full max-w-[340px]"
      >
        {/* 网格环与轴线 */}
        <motion.g
          initial={{ opacity: 0 }}
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
                className="stroke-border/40"
              />
            );
          })}
        </motion.g>

        {/* 数据多边形：缩放展开 */}
        <motion.g
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <polygon
            points={dataPolygon}
            strokeWidth={2}
            strokeLinejoin="round"
            className="fill-primary/15 stroke-primary"
          />
          {dataPoints.map((p) => (
            <circle
              key={p.key}
              cx={p.x}
              cy={p.y}
              r={3.5}
              strokeWidth={2}
              className="fill-primary stroke-background"
            />
          ))}
        </motion.g>

        {/* 轴标签（名称 + 分值） */}
        <motion.g
          initial={{ opacity: 0 }}
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
                className="fill-muted-foreground text-[11px]"
              >
                {axis.label}{" "}
                <tspan className="fill-primary font-semibold">
                  {axis.value}
                </tspan>
              </text>
            );
          })}
        </motion.g>
      </svg>
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
