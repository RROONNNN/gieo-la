import { redirect } from "next/navigation";
import { fetchPost } from "@/lib/api/posts";
import { getCurrentUserFromCookie } from "@/lib/auth/server";
import { EditPostForm } from "@/components/posts/EditPostForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  const [post, viewer] = await Promise.all([
    fetchPost(id).catch(() => null),
    getCurrentUserFromCookie(),
  ]);

  if (!post) redirect(`/posts/${id}`);
  if (!viewer) redirect("/login");

  const authorId =
    typeof post.author === "string" ? post.author : post.author._id;
  if (viewer._id !== authorId) redirect(`/posts/${id}`);
  if (post.status !== "available") redirect(`/posts/${id}`);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Chỉnh sửa bài đăng</h1>
      <EditPostForm post={post} />
    </div>
  );
}
