import { useState, ImgHTMLAttributes } from "react";

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export function ImageWithFallback({
  src,
  fallback = "https://via.placeholder.com/400x300?text=No+Image",
  alt,
  ...props
}: ImageWithFallbackProps) {
  const [imgError, setImgError] = useState(false);

  const handleError = () => {
    setImgError(true);
  };

  return (
    <img
      src={imgError ? fallback : src}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
}
