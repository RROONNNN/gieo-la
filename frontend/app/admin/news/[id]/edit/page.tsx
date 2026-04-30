import { notFound } from "next/navigation";
import { adminGetNewsServer } from "@/lib/api/adminNews.server";
import { NewsForm } from "@/components/admin/NewsForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Chỉnh sửa bài bản tin — Admin",
};

export default async function AdminNewsEditPage({ params }: PageProps) {
  const { id } = await params;

  let post;
  try {
    post = await adminGetNewsServer(id);
  } catch {
    notFound();
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-brand-darker">
        Chỉnh sửa bài bản tin
      </h1>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
        {post.title}
      </p>
      <div className="mt-8 max-w-3xl">
        <NewsForm post={post} />
      </div>
    </div>
  );
}
