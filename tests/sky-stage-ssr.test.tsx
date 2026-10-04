import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import SkyStage from '../src/components/SkyStage';

describe('SkyStage server render', () => {
  it('renders the static SVG fallback and an aria-hidden canvas without touching WebGL', () => {
    const html = renderToString(<SkyStage claims={[{ id: 'a', evidence: 2 }]} sectionIds={['operasi']} />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('<svg');
    expect(html).toContain('<canvas');
  });
  it('renders with zero claims', () => {
    expect(() => renderToString(<SkyStage claims={[]} sectionIds={[]} />)).not.toThrow();
  });
});
