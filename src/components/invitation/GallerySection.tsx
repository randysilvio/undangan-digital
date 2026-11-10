import type { GalleryPhoto } from '@/lib/types'
import { Section } from './Section'

export function GallerySection({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <Section id="galeri" title="Galeri">
      <div className="grid grid-cols-2 gap-2">
        {photos.map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- foto unggahan sudah dikompres
          <img
            key={p.id}
            src={p.url}
            alt={`Foto ${i + 1}`}
            loading="lazy"
            className={`w-full rounded-lg object-cover ${i % 3 === 0 ? 'col-span-2 aspect-[4/3]' : 'aspect-square'}`}
          />
        ))}
      </div>
    </Section>
  )
}
