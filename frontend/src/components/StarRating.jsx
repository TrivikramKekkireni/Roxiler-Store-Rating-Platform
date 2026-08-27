import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({
  rating = 0,
  maxStars = 5,
  interactive = false,
  onChange = () => {},
  size = 'md',
  showLabel = false,
  disabled = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const currentVal = hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }, (_, i) => {
          const starValue = i + 1;
          const isFilled = currentVal >= starValue;
          const isPartiallyFilled = !isFilled && currentVal > i && currentVal < starValue;

          return (
            <button
              type="button"
              key={starValue}
              disabled={!interactive || disabled}
              onClick={() => interactive && !disabled && onChange(starValue)}
              onMouseEnter={() => interactive && !disabled && setHoverRating(starValue)}
              onMouseLeave={() => interactive && !disabled && setHoverRating(0)}
              className={`p-0.5 rounded transition-transform ${
                interactive && !disabled
                  ? 'cursor-pointer hover:scale-125 focus:outline-none focus:ring-1 focus:ring-amber-400'
                  : 'cursor-default'
              }`}
              aria-label={`${starValue} Stars`}
            >
              <Star
                className={`${sizeClasses[size] || sizeClasses.md} transition-colors ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                    : isPartiallyFilled
                    ? 'text-amber-400 fill-amber-400/50'
                    : 'text-slate-600 fill-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold text-slate-300 ml-1">
          {rating > 0 ? rating.toFixed(1) : 'No ratings yet'}
        </span>
      )}
    </div>
  );
};

export default StarRating;
