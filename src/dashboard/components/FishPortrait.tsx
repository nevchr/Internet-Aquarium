import { useEffect, useRef } from 'react';
import { fishTexture, drawFish } from '../../aquarium/fish/paint';
import type { DomainRecord } from '../../shared/models';
export function FishPortrait({ record, small = false }: { record: DomainRecord; small?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!; const ctx = canvas.getContext('2d')!; const texture = fishTexture(record);
    const tailLength = texture.traits.tailType === 'Long' ? 66 : 40;
    const verticalReach = 36 * texture.traits.bodyHeight * 2.2 + 6;
    const scale = Math.min(small ? .6 : 1.7, canvas.width * .57 / (36 * texture.traits.bodyLength + tailLength), canvas.height * .44 / verticalReach);
    ctx.clearRect(0, 0, canvas.width, canvas.height); drawFish(ctx, texture, canvas.width * .6, canvas.height / 2, scale, 1, 0);
  }, [record, small]);
  return <canvas ref={ref} width={small ? 90 : 300} height={small ? 60 : 170} className={small ? 'fish-mini' : 'fish-portrait'} aria-label={`Procedural fish for ${record.hostname}`} role="img"/>;
}
