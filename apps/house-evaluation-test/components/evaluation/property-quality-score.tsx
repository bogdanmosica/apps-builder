'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Progress } from '@workspace/ui/components/progress';
import { Button } from '@workspace/ui/components/button';
import { StarRating } from '@/components/ui/star-rating';
import { BarChart3, Eye, EyeOff, Loader2 } from 'lucide-react';
import type { QualityScoreBreakdown } from '@/lib/evaluation/service';

interface PropertyQualityScoreProps {
  propertyId: number;
  showBreakdown?: boolean;
  compact?: boolean;
}

export function PropertyQualityScore({
  propertyId,
  showBreakdown = false,
  compact = false,
}: PropertyQualityScoreProps) {
  const [scoreData, setScoreData] = useState<QualityScoreBreakdown | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(showBreakdown);

  useEffect(() => {
    fetchQualityScore();
  }, [propertyId]);

  const fetchQualityScore = async () => {
    try {
      const response = await fetch(`/api/evaluation/score/${propertyId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setScoreData(null);
          return;
        }
        throw new Error('Failed to fetch quality score');
      }

      const data = await response.json();
      setScoreData(data);
    } catch (error) {
      console.error('Error fetching quality score:', error);
      setScoreData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center gap-2 py-2'>
        <Loader2 className='h-4 w-4 animate-spin' />
        <span className='text-sm text-gray-600'>Loading score...</span>
      </div>
    );
  }

  if (!scoreData) {
    return (
      <div className='text-sm text-gray-500'>
        {compact ? 'Not rated' : 'Property has not been evaluated yet'}
      </div>
    );
  }

  if (compact) {
    return (
      <div className='flex items-center gap-2'>
        <StarRating rating={scoreData.starRating} size='sm' />
        <Badge variant='secondary' className='text-xs'>
          {scoreData.totalScore}/100
        </Badge>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg'>Quality Rating</CardTitle>
          {!showBreakdown && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? (
                <>
                  <EyeOff className='h-4 w-4 mr-1' />
                  Hide Details
                </>
              ) : (
                <>
                  <Eye className='h-4 w-4 mr-1' />
                  Show Details
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <StarRating rating={scoreData.starRating} size='lg' />
            <div>
              <div
                className={`text-2xl font-bold ${getScoreColor(scoreData.totalScore)}`}
              >
                {scoreData.totalScore}/100
              </div>
              <div className='text-sm text-gray-600'>
                {getScoreLabel(scoreData.totalScore)}
              </div>
            </div>
          </div>
          <Badge
            variant={
              scoreData.totalScore >= 80
                ? 'default'
                : scoreData.totalScore >= 60
                  ? 'secondary'
                  : 'destructive'
            }
            className='px-3 py-1'
          >
            {scoreData.starRating} Star{scoreData.starRating !== 1 ? 's' : ''}
          </Badge>
        </div>

        {(showDetails || showBreakdown) && (
          <div className='space-y-3 pt-3 border-t'>
            <div className='flex items-center gap-2 text-sm font-medium text-gray-700'>
              <BarChart3 className='h-4 w-4' />
              Score Breakdown
            </div>
            {scoreData.categoryScores.map((category) => (
              <div key={category.category} className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='font-medium capitalize'>
                    {category.category.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className='flex items-center gap-2'>
                    <span className={getScoreColor(category.score)}>
                      {category.score}/100
                    </span>
                    <Badge variant='outline' className='text-xs'>
                      Weight: {category.weight}%
                    </Badge>
                  </div>
                </div>
                <Progress value={category.score} className='h-2' />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
