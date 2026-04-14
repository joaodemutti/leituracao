import { useState } from "react";

export default function BookCard({ book }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  return (
    <>
      <div
        onClick={handleOpenModal}
        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
      >
        {/* Cover Image */}
        <div className="aspect-video bg-gradient-to-br from-navy to-blue flex items-center justify-center overflow-hidden">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="text-center p-4">
              <div className="text-2xl mb-2">📚</div>
              <p className="text-white text-xs font-semibold">{book.title}</p>
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
            {book.title}
          </h3>
          <p className="text-gray-600 text-xs mb-2">{book.author}</p>

          {/* Tags */}
          {book.tags && book.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {book.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-soft text-blue text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal();
            }}
            className="w-full py-2 bg-gold hover:bg-gold-light text-navy font-semibold rounded text-sm transition-colors"
          >
            Leia Agora
          </button>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-serif font-bold text-navy">
                {book.title}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              <span className="font-semibold">Autor:</span> {book.author}
            </p>

            {book.description && (
              <p className="text-gray-700 mb-4">{book.description}</p>
            )}

            <div className="flex gap-4">
              <a
                href={book.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 bg-blue text-white font-semibold rounded text-center hover:bg-blue/90 transition-colors"
              >
                Abrir Livro
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded hover:border-gray-400 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
