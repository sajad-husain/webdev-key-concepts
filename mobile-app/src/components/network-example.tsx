import { useEffect, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getPosts, type Post } from '@/services/api';

type FetchStatus = 'loading' | 'error' | 'ready';

export function NetworkExample() {
  const theme = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<FetchStatus>('loading');

  useEffect(() => {
    let cancelled = false;

    getPosts(3)
      .then((data) => {
        if (cancelled) {
          return;
        }
        setPosts(data);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setStatus('loading');
    setAttempt((previous) => previous + 1);
  };

  if (status === 'loading') {
    return (
      <Card>
        <ThemedText type="small" themeColor="textSecondary">
          Fetching a few posts…
        </ThemedText>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card style={{ gap: Spacing.three }}>
        <ThemedText type="small" style={{ color: theme.danger }}>
          Couldn&apos;t reach the network.
        </ThemedText>
        <Button title="Retry" variant="secondary" onPress={retry} />
      </Card>
    );
  }

  return (
    <Card>
      {posts.map((post) => (
        <ThemedText type="small" key={post.id} themeColor="textSecondary">
          {post.title}
        </ThemedText>
      ))}
    </Card>
  );
}