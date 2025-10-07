import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createCaller } from "../../../server/caller";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";

interface MoviePageProps {
  params: { id: string };
}

export default async function MovieDetailPage({ params }: MoviePageProps) {
  const { id } = params;
  const caller = await createCaller();
  const movie = await caller.movies.byId({ id });

  if (!movie) {
    notFound();
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <Link href="/movies" className="text-sm text-primary hover:underline">
        ← Back to movies
      </Link>
      <Card className="overflow-hidden border-border/80 bg-card/80">
        <div className="grid gap-6 md:grid-cols-[220px,1fr]">
          {movie.poster_path ? (
            <div className="relative h-[330px] w-full">
              <Image
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-[330px] items-center justify-center bg-secondary/40 text-secondary-foreground">
              No image
            </div>
          )}
          <CardContent className="space-y-4 py-6">
            <div>
              <h1 className="text-3xl font-semibold">{movie.title}</h1>
              {movie.tagline && <p className="text-lg text-muted-foreground">{movie.tagline}</p>}
            </div>
            {movie.overview && <p className="text-muted-foreground">{movie.overview}</p>}
            <ul className="text-sm text-muted-foreground">
              {movie.release_date && <li>Release date: {movie.release_date}</li>}
              {movie.runtime && <li>Runtime: {movie.runtime} min</li>}
              {Array.isArray(movie.genres) && movie.genres.length > 0 && (
                <li>Genres: {movie.genres.map((genre: any) => genre.name).join(", ")}</li>
              )}
            </ul>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <Link href={`/compare/${movie.id}`}>Find best seats</Link>
              </Button>
              {movie.homepage && (
                <Button asChild variant="outline">
                  <Link href={movie.homepage} target="_blank" rel="noreferrer">
                    Official site
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </section>
  );
}
