import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold mb-2">Problem Matters</h3>
            <p className="text-sm text-muted-foreground">
              Discovering and cataloging industry problems to help identify
              opportunities for impactful solutions.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/industries"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Industries
                </Link>
              </li>
              <li>
                <Link
                  href="/problems"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Problems
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold mb-3">About</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-muted-foreground">
                  Research data viewer
                </span>
              </li>
              <li>
                <span className="text-muted-foreground">
                  Local-first, zero backend
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Problem Matters. Research data for
            analysis purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}
