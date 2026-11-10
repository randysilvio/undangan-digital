import type { GalleryPhoto } from '@/lib/types'
import { GalleryLightbox } from './GalleryLightbox'
import { Section } from './Section'

export function GallerySection({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <Section id="galeri" title="Galeri">
      <GalleryLightbox photos={photos} />
    </Section>
  )
}
