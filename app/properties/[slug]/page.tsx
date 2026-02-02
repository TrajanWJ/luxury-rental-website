import { notFound } from "next/navigation"
import { properties } from "@/lib/data"
import type { Metadata, ResolvingMetadata } from 'next'
import PropertyClient from "./PropertyClient"

function slugify(text: string) {
    return text.toLowerCase().replace(/\s+/g, '-')
}

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { slug } = await params
    const property = properties.find((p) => p.id === slug || slugify(p.name) === slug)

    if (!property) return {}

    return {
        title: `${property.name} | Wilson Premier Properties`,
        description: property.teaser,
        openGraph: {
            title: property.name,
            description: property.teaser,
            images: [property.image],
        },
        twitter: {
            card: 'summary_large_image',
            title: property.name,
            description: property.teaser,
            images: [property.image],
        },
    }
}

export default async function PropertyPage({ params }: Props) {
    const { slug } = await params
    const property = properties.find((p) => p.id === slug || slugify(p.name) === slug)

    if (!property) {
        notFound()
    }

    return <PropertyClient property={property} />
}
