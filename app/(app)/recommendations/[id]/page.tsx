type RecommendationPageProps = { params: { id: string } };

export default function RecommendationDetailPage({ params }: RecommendationPageProps) {
  return <main>Placeholder: Recommendation detail for {params.id}.</main>;
}
