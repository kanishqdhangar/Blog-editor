'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';

const ToastifyCSS = 'https://cdnjs.cloudflare.com/ajax/libs/react-toastify/9.1.1/ReactToastify.min.css';

// Type definition for the data expected to be returned/sent
type Blog = {
  _id?: string; // This means string | undefined
  title: string;
  content: string;
  tags: string[];
  status: 'draft' | 'published';
};

const API = {
  // Mock function to simulate an HTTP GET request
  get: async <T,>(url: string): Promise<{ data: T }> => {
    console.log(`MOCK API: GET ${url}`);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    // Mock data for fetching an existing blog (only works if id is present)
    const blogId = url.replace('/', '');
    if (blogId === 'mock-blog-123') {
      return {
        data: {
          _id: blogId,
          title: "Pre-existing Blog Title",
          content: "This is the content of the blog loaded from the mock API.",
          tags: ["mock", "loaded"],
          status: 'draft',
        } as T,
      };
    }
    // If a different mock ID is used or no data, throw an error
    throw new Error('No mock data for ID');
  },
  // Mock function to simulate an HTTP POST request
  post: async <T,>(url: string, payload: object): Promise<{ data: T }> => {
    console.log(`MOCK API: POST ${url} with payload:`, payload);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const blogPayload = payload as Blog;

    // Simulate ID generation for new drafts
    const newId = blogPayload._id || (blogPayload as any).id || 'mock-' + Math.random().toString(36).substring(2, 9);

    return {
      data: {
        _id: newId,
        title: blogPayload.title,
        content: blogPayload.content,
        tags: blogPayload.tags,
        status: blogPayload.status,
      } as T,
    };
  },
};


export default function BlogEditor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [blogId, setBlogId] = useState<string | null>(null);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Next.js Navigation Fix: Simulate router and searchParams locally
  const idFromQuery = 'mock-blog-123'; // Hardcoded mock ID to demonstrate editing mode
  const router = {
      push: (path: string) => {
          console.log(`MOCK ROUTER: Navigating to ${path}`);
          setIsRedirecting(true); // Simulate redirect visually
      }
  }

  const savingRef = useRef(false);
  const justPublishedRef = useRef(false);

  // Use useCallback to memoize the saveDraft function, resolving the exhaustive-deps warning.
  const saveDraft = useCallback(
    async (auto = false) => {
      if (savingRef.current) return;
      
      // Prevent saving if title and content are both empty (initial mount check)
      if (!title && !content) return;

      savingRef.current = true;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      try {
        const payload: Blog = {
          _id: blogId ?? undefined,
          title,
          content,
          tags: tags.split(',').map((tag) => tag.trim()),
          status: 'draft', // ✅ always draft for this
        };

        const res = await API.post<Blog>('/save-draft', payload);

        if (!blogId) {
          setBlogId(res.data._id || null);
        }

        toast.info(auto ? 'Auto-saved draft' : 'Draft saved');
      } catch {
        toast.error('Failed to save draft');
      } finally {
        savingRef.current = false;
      }
    },
    [blogId, title, content, tags], // saveDraft depends on these states
  );

  // Fetch blog data if editing (id param exists)
  useEffect(() => {
    // We only fetch if we have a hardcoded mock ID for demonstration
    if (!idFromQuery) return;

    async function fetchBlog() {
      try {
        // The mock API is designed to return data when an ID is used
        const res = await API.get<Blog>(`/${idFromQuery}`);
        const blog = res.data;
        setBlogId(blog._id || null);
        setTitle(blog.title);
        setContent(blog.content);
        setTags(blog.tags.join(', '));
        setStatus(blog.status);
        toast.success(`Loaded blog: ${blog.title}`);
      } catch (_err) {
        // Unused variable already fixed in previous iteration
        toast.error('Failed to load blog for editing. Starting new draft.');
        setBlogId(null);
      }
    }

    fetchBlog();
  }, [idFromQuery]);

  // Auto-save draft after typing stops
  useEffect(() => {
    // If the component is freshly mounted and empty, don't start timer
    if (!title && !content) return;

    // Skip auto-save if already published
    if (status === 'published') {
      return;
    }

    // Skip auto-save if the user just clicked the Publish button
    if (justPublishedRef.current) {
      justPublishedRef.current = false;
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveDraft(true);
    }, 5000);
    
    // Cleanup function
    return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [title, content, tags, status, saveDraft]); 

  const publish = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    try {
      const payload: Blog = {
        // FIX: Use ?? undefined to convert string | null to string | undefined
        _id: blogId ?? undefined,
        title,
        content,
        tags: tags.split(',').map((tag) => tag.trim()),
        status: 'published', // 👈 explicitly set status
      };

      await API.post('/publish', payload);
      setStatus('published'); // 👈 update local state
      toast.success('Blog published! Redirecting...');
      justPublishedRef.current = true;
      router.push('/');
    } catch {
      toast.error('Failed to publish');
    }
  };

  if (isRedirecting) {
      return (
          <div className="max-w-3xl mx-auto p-6 mt-10 text-center">
              <p className="text-xl text-blue-600 font-semibold">Redirecting back to dashboard...</p>
              <p className="text-gray-500 mt-2">Check console for mock navigation status.</p>
          </div>
      );
  }

  return (
    <>
      <link rel="stylesheet" href={ToastifyCSS} />
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
        <ToastContainer position="bottom-right" autoClose={3000} />
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">
          {blogId ? 'Edit Blog' : 'Write a New Blog'}
        </h1>
        
        <div className={`mb-4 text-sm font-medium p-2 rounded ${status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          Status: {status === 'published' ? 'Published' : 'Draft (Auto-save enabled)'}
        </div>

        <input
          type="text"
          className="w-full border border-gray-300 p-3 mb-4 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg"
          placeholder="Post Title (required)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full border border-gray-300 p-3 mb-4 rounded-lg h-64 focus:ring-blue-500 focus:border-blue-500 resize-y"
          placeholder="Start writing your content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          type="text"
          className="w-full border border-gray-300 p-3 mb-6 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="Tags (e.g., nodejs, react, career)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <div className="flex gap-4 items-center">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg shadow-md transition duration-200 disabled:opacity-50"
            onClick={() => saveDraft()}
            disabled={savingRef.current}
          >
            {savingRef.current ? 'Saving...' : 'Save Draft Manually'}
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md transition duration-200 disabled:opacity-50"
            onClick={publish}
            disabled={!title || !content} // Require title and content to publish
          >
            Publish Post
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded-lg transition duration-200"
            onClick={() => router.push('/')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </>
  );
}