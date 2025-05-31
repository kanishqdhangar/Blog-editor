'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import API from '../lib/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Blog = {
  _id?: string;
  title: string;
  content: string;
  tags: string[];
  status: 'draft' | 'published';
};

export default function BlogEditor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [blogId, setBlogId] = useState<string | null>(null);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const idFromQuery = searchParams.get('id');

  const savingRef = useRef(false);
  const justPublishedRef = useRef(false);

  // Fetch blog data if editing (id param exists)
  useEffect(() => {
    if (!idFromQuery) return;

    async function fetchBlog() {
      try {
        const res = await API.get<Blog>(`/${idFromQuery}`);
        const blog = res.data;
        setBlogId(blog._id || null);
        setTitle(blog.title);
        setContent(blog.content);
        setTags(blog.tags.join(', '));
        setStatus(blog.status);
      } catch (err) {
        toast.error('Failed to load blog for editing');
      }
    }

    fetchBlog();
  }, [idFromQuery]);

  // Auto-save draft after typing stops
  useEffect(() => {
    if (!title && !content) return;

    if (status === 'published') {
    // Skip auto-save if already published
    return;
    }

    if (justPublishedRef.current) {
      justPublishedRef.current = false;
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveDraft(true);
    }, 5000);
  }, [title, content, tags, status]);

    const saveDraft = async (auto = false) => {
        if (savingRef.current) return;
        savingRef.current = true;

        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        try {
            const payload = {
            ...(blogId ? { id: blogId } : {}),
            title,
            content,
            tags: tags.split(',').map((tag) => tag.trim()),
            status: 'draft', // ✅ always draft for this
            };

            const res = await API.post<Blog>('/save-draft', payload);

            if (!blogId) {
            setBlogId(res.data._id || null);
            }

            toast(auto ? 'Auto-saved draft' : 'Draft saved');
        } catch {
            toast.error('Failed to save draft');
        } finally {
            savingRef.current = false;
        }
    };


  const publish = async () => {
    if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }

    try {
      const payload = {
        id: blogId,
        title,
        content,
        tags: tags.split(',').map((tag) => tag.trim()),
        status: 'published', // 👈 explicitly set status
      };

      await API.post('/publish', payload);
      setStatus('published'); // 👈 update local state
      toast.success('Blog published');
      justPublishedRef.current = true;
      router.push('/');
    } catch {
      toast.error('Failed to publish');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">{blogId ? 'Edit Blog' : 'Write a Blog'}</h1>
      <input
        type="text"
        className="w-full border border-gray-300 p-2 mb-4 rounded"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full border border-gray-300 p-2 mb-4 rounded h-40"
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input
        type="text"
        className="w-full border border-gray-300 p-2 mb-4 rounded"
        placeholder="Tags (comma-separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <div className="flex gap-4">
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          onClick={() => saveDraft()}
        >
          Save Draft
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={publish}
        >
          Publish
        </button>
        <button
          className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded"
          onClick={() => router.push('/')}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
