'use client';

import { useEffect, useState } from 'react';
import API from '../lib/api';
import Link from 'next/link';



type Blog = {
  _id: string;
  title: string;
  content: string;
  status: 'draft' | 'published';
  tags: string[]; 
};

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [sortDraftFirst, setSortDraftFirst] = useState(true);
  useEffect(() => {
    API.get('/').then((res) => {
      const blogs = res.data as Blog[];

      // Sort drafts first, then published
      blogs.sort((a, b) => {
        if (a.status === b.status) return 0;
        if (sortDraftFirst) {
          return a.status === 'draft' ? -1 : 1;
        } else {
          return a.status === 'published' ? -1 : 1;
        }
      });


      setBlogs(blogs);
    });
  }, [sortDraftFirst]);


  return (
    <>
      <header className="bg-blue-100 text-center border-b shadow-sm px-6 py-4 mb-6 ">
        <h1 className="text-3xl font-extrabold text-gray-900">All Blogs</h1>
      </header>
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => setSortDraftFirst((prev) => !prev)}
          className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg shadow flex items-center gap-2"
        >
          {sortDraftFirst ? '📄 Drafts First' : '✅ Published First'}
        </button>


        <Link href="/editor">
          <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow">
            + New Blog
          </button>
        </Link>
      </div>


      <div className="grid gap-6">
        {blogs.map((blog) => (
          <div
            key={blog._id}
            className="group relative border border-gray-300 rounded-xl p-5 bg-white hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-semibold text-gray-800">{blog.title.charAt(0).toUpperCase() + blog.title.slice(1)}</h2>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  blog.status === 'published'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
              </span>
            </div>

            <p className="text-gray-700 line-clamp-3">{blog.content}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              {blog.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Edit Button for Drafts, visible on hover */}
            {blog.status === 'draft' && (
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/editor?id=${blog._id}`}>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-md shadow">
                    Edit
                  </button>
                </Link>
              </div>
            )}
          </div>

        ))}
      </div>
      
    </div>
    {/* Footer */}
      <footer className="text-center py-6 bg-blue-100 mt-10 text-sm text-gray-600 w-full">
        © {new Date().getFullYear()} Kanishq Kumar Dhangar. All rights reserved.
      </footer>
    </>
  );
}
