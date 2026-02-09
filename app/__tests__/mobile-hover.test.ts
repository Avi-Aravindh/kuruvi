/**
 * Mobile Hover State Tests
 * 
 * These tests verify that hover states don't stick on mobile touch devices.
 * The fix uses CSS @media (hover: hover) to only apply hover effects on devices
 * that support hovering (like desktops with mice).
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Mobile Hover Fix', () => {
  it('should use CSS-only hover styles instead of JavaScript handlers', () => {
    const pageContent = fs.readFileSync(
      path.join(__dirname, '../page.tsx'),
      'utf-8'
    );

    // Count onMouseEnter occurrences (should be zero)
    const mouseEnterCount = (pageContent.match(/onMouseEnter/g) || []).length;
    const mouseLeaveCount = (pageContent.match(/onMouseLeave/g) || []).length;

    expect(mouseEnterCount).toBe(0);
    expect(mouseLeaveCount).toBe(0);
  });

  it('should have CSS classes for buttons with hover effects', () => {
    const pageContent = fs.readFileSync(
      path.join(__dirname, '../page.tsx'),
      'utf-8'
    );

    expect(pageContent).toContain('btn-clear-all');
    expect(pageContent).toContain('btn-new');
    expect(pageContent).toContain('btn-agent-header');
    expect(pageContent).toContain('btn-agent-delete');
    expect(pageContent).toContain('btn-agent-add');
    expect(pageContent).toContain('task-card');
  });

  it('should have @media (hover: hover) in globals.css', () => {
    const cssContent = fs.readFileSync(
      path.join(__dirname, '../globals.css'),
      'utf-8'
    );

    expect(cssContent).toContain('@media (hover: hover)');
    expect(cssContent).toContain('.btn-clear-all:hover');
    expect(cssContent).toContain('.btn-new:hover');
    expect(cssContent).toContain('.btn-agent-delete:hover');
    expect(cssContent).toContain('.task-card:hover');
  });

  it('should use CSS variables for dynamic agent colors', () => {
    const pageContent = fs.readFileSync(
      path.join(__dirname, '../page.tsx'),
      'utf-8'
    );

    expect(pageContent).toContain('--agent-accent-color');
    expect(pageContent).toContain('--agent-accent-bg');
  });

  it('should preserve transition styles for smooth animations', () => {
    const pageContent = fs.readFileSync(
      path.join(__dirname, '../page.tsx'),
      'utf-8'
    );

    const transitionCount = (pageContent.match(/transition:/g) || []).length;
    expect(transitionCount).toBeGreaterThan(10);
  });
});
