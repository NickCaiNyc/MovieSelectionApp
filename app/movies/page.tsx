import Link from "next/link";
import Image from "next/image";
import { createCaller } from "../../server/caller";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { PreferenceModal } from "../../components/PreferenceModal";

export const dynamic = "force-dynamic";

export default async function MoviesPage() {
  const caller = await createCaller();
  const movies = await caller.movies.list();
  const results = Array.isArray(movies) ? movies : movies.results;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Now Playing</h1>
          <p className="text-muted-foreground">Browse movies and find the perfect seats before booking.</p>
        </div>
        <PreferenceModal userId="demo-user" />
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results?.length ? (
          results.map((movie: any) => (
            <Card key={movie.id} className="flex flex-col overflow-hidden border-border/80 bg-card/70">
              {movie.poster_path ? (
                <div className="relative h-72 w-full">
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-72 items-center justify-center bg-secondary/50 text-secondary-foreground">No image</div>
              )}
              <CardHeader>
                <CardTitle>{movie.title}</CardTitle>
                {movie.release_date && <CardDescription>Released {movie.release_date}</CardDescription>}
              </CardHeader>
              <CardContent className="flex-1">
                <p className="line-clamp-4 text-sm text-muted-foreground">{movie.overview}</p>
              </CardContent>
              <CardFooter className="mt-auto flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rating: {movie.vote_average?.toFixed?.(1) ?? "N/A"}</span>
                <Button asChild>
                  <Link href={`/movie/${movie.id}`}>View details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No movies available yet. Configure TMDb or add more mock data.</p>
        )}
      </div>
    </section>
  );
}
