'use client';

import { useState, useEffect } from 'react';
import { WandSparkles } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAiBrief } from '@/lib/actions';
import { Skeleton } from '../ui/skeleton';

export function AiBrief() {
  const [brief, setBrief] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const generateBrief = async () => {
    setIsLoading(true);
    setError('');
    const result = await getAiBrief();
    if (result.success && result.brief) {
      setBrief(result.brief);
    } else {
      setError(result.error || 'An unknown error occurred.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    generateBrief();
  }, []);

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <WandSparkles className="h-5 w-5 text-primary" />
                    AI Administrative Brief
                </CardTitle>
                <CardDescription>
                    A summary of housing trends and system activity.
                </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={generateBrief} disabled={isLoading}>
                Regenerate
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {brief}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
            Generated at {new Date().toLocaleTimeString()}
        </p>
      </CardFooter>
    </Card>
  );
}
