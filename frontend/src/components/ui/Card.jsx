import { motion } from "framer-motion";

export default function Card({ title, value }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white/10 backdrop-blur-lg p-5 rounded-2xl shadow-lg border border-white/10"
    >
      <p className="text-sm text-zinc-400">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </motion.div>
  );
}