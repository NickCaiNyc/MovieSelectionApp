import Link from "next/link";
import { createCaller } from "../../../server/caller";
import { SeatMapGrid } from "../../../components/SeatMapGrid";
import { SeatLegend } from "../../../components/SeatLegend";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

interface ComparePageProps {
  params: { movieId: string };
  searchParams?: { partySize?: string };
}

export default async function ComparePage({ params, searchParams }: ComparePageProps) {
  const { movieId } = params;
  const partySize = Number(searchParams?.partySize ?? "2");
  const caller = await createCaller();
  const [movie, showtimes] = await Promise.all([
    caller.movies.byId({ id: movieId }),
    caller.showtimes.nearby({ movieId, radiusKm: 50 }),
  ]);

  const comparison = await Promise.all(
    showtimes.map(async (showtime: any) => {
      const seatResult = await caller.seats.topBlocks({ showtimeId: showtime.id, partySize });
      return {
        showtime,
        seatResult,
      };
    })
  );

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <Link href={`/movie/${movieId}`} className="text-sm text-primary hover:underline">
          ← Back to movie
        </Link>
        <h1 className="text-3xl font-bold">Best seats for {movie?.title ?? "selected movie"}</h1>
        <p className="text-muted-foreground">
          Comparing top seat blocks across nearby theaters using your saved preferences. Update the party size by editing the URL
          query (?partySize=4).
        </p>
        <SeatLegend className="mt-2" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {comparison.map(({ showtime, seatResult }) => {
          const topBlock = seatResult.blocks[0];
          const score = topBlock?.score ? Math.round(topBlock.score * 100) : null;
          return (
            <Card key={showtime.id} className="border-border/80 bg-card/80">
              <CardHeader>
                <CardTitle>{showtime.theater?.name ?? "Theater"}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(showtime.startAt).toLocaleString()} • {showtime.theater?.city ?? "Unknown city"}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {seatResult.seatMap ? (
                  <SeatMapGrid
                    rows={seatResult.seatMap.rows}
                    cols={seatResult.seatMap.cols}
                    taken={seatResult.seatMap.taken}
                    restricted={seatResult.seatMap.restricted ?? []}
                    highlights={seatResult.blocks.slice(0, 3)}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">Seat map not available yet. Add one via Prisma.</p>
                )}
                {topBlock ? (
                  <div className="rounded-md border border-border/80 bg-secondary/40 p-3 text-sm text-secondary-foreground">
                    <p>
                      Best block: Row {topBlock.row + 1}, Seats {topBlock.col + 1} - {topBlock.col + topBlock.size}
                    </p>
                    <p>Score: {score ? `${score}/100 (${topBlock.grade})` : "N/A"}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No contiguous seats found for the selected party size.</p>
                )}
                {showtime.bookingUrl ? (
                  <Button asChild variant="outline">
                    <Link href={showtime.bookingUrl} target="_blank" rel="noreferrer">
                      Book on theater site
                    </Link>
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">Add a bookingUrl field in the database to deep link bookings.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
