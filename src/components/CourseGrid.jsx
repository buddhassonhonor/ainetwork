import React from 'react';
import { motion } from 'framer-motion';
import { courses } from '../data/courses';
import { ExternalLink, Star } from 'lucide-react';

const CourseGrid = () => {
  return (
    <section id="courses" className="section-container">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl mb-4">名师教学团队</h2>
          <p className="text-slate-500 text-lg">泉州师范学院物理与信息工程学院计算机网络核心教研组</p>
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
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-2xl font-extrabold group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                <Star size={20} className="text-amber-400 fill-amber-400" />
              </div>
              <p className="text-lg text-slate-500 mb-6 font-bold">{course.school} · {course.lecturer}</p>
              <p className="text-base text-slate-500 mb-8 line-clamp-3 leading-relaxed font-medium">{course.description}</p>
              
              <button className="w-full py-4 flex items-center justify-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all font-bold text-lg">
                查看详情 <ExternalLink size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CourseGrid;
