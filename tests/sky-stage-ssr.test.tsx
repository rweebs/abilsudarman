import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import SkyStage from '../src/components/SkyStage';

describe('SkyStage server render', () => {
  it('renders the static SVG fallback and an aria-hidden canvas without touching WebGL', () => {
    const html = renderToString(<SkyStage sectionIds={['operasi']} />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('<svg');
    expect(html).toContain('<canvas');
  });
  it('renders with no sections', () => {
    expect(() => renderToString(<SkyStage sectionIds={[]} />)).not.toThrow();
  });
});
