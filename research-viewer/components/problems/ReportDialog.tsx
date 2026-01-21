'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { AlertCircle, Loader2 } from 'lucide-react';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  problemSlug: string;
  problemTitle: string;
  industrySlug: string;
  domainSlug: string;
  fieldSlug?: string;
}

export function ReportDialog({
  isOpen,
  onClose,
  problemSlug,
  problemTitle,
  industrySlug,
  domainSlug,
  fieldSlug,
}: ReportDialogProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && problemSlug) {
      setLoading(true);
      setError(null);
      setContent(null);

      // Build the report path based on the problem's location
      const reportPath = fieldSlug
        ? `/research-data/industries/${industrySlug}/${domainSlug}/fields/reports/${problemSlug}.md`
        : `/research-data/industries/${industrySlug}/${domainSlug}/reports/${problemSlug}.md`;

      fetch(reportPath)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Report not found');
          }
          return response.text();
        })
        .then((text) => {
          setContent(text);
          setLoading(false);
        })
        .catch(() => {
          setError('No research report available for this problem.');
          setLoading(false);
        });
    }
  }, [isOpen, problemSlug, industrySlug, domainSlug, fieldSlug]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] !grid grid-rows-[auto_1fr] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="pr-8">Research Report: {problemTitle}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full overflow-hidden">
          <div className="pr-4">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {error && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-4" />
                <p>{error}</p>
              </div>
            )}
            {content && <MarkdownRenderer content={content} />}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
