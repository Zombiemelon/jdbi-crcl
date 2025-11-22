type FriendPageProps = { params: { id: string } };

export default function FriendProfilePage({ params }: FriendPageProps) {
  return <main>Placeholder: Friend profile view for {params.id}.</main>;
}
