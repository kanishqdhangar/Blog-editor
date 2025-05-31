'use client';
import dynamic from 'next/dynamic';

const BlogEditor = dynamic(() => import('../../components/BlogEditor'), {
  ssr: false,
});

export default function EditorPage() {
  return <BlogEditor />;
}
