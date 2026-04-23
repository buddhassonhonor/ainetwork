import React from 'react';
import { motion } from 'framer-motion';
import { courses } from '../data/courses';
import { ExternalLink, Star } from 'lucide-react';

const CourseGrid = () => {
  return (
    <section id="courses" className="section-container">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl mb-4">名校精品课程</h2>
          <p className="text-slate-400 text-lg">汇集全国顶级学府的计算机网络核心课程</p>
        </div>
        <div className="flex gap-2">
          {['全部', '国家精品', '名校推荐', '考研必备'].map((filter) => (
            <button key={filter} className="px-4 py-2 text-sm font-semibold glass rounded-lg hover:bg-white/10 transition-colors">
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group glass rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all duration-500"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={course.image} 
                alt={course.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                {course.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 text-[10px] font-bold bg-black/60 backdrop-blur-md rounded-md uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl group-hover:text-indigo-400 transition-colors">{course.title}</h3>
                <Star size={16} className="text-amber-400 fill-amber-400" />
              </div>
              <p className="text-sm text-slate-400 mb-4 font-medium">{course.school} · {course.lecturer}</p>
              <p className="text-sm text-slate-500 mb-6 line-clamp-2">{course.description}</p>
              
              <button className="w-full py-3 flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold text-sm">
                查看详情 <ExternalLink size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CourseGrid;
