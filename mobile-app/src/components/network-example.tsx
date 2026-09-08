import { useCallback, useEffect, useState } from 'react';

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
  const [status, setStatus] = useState<FetchStatus>('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setPosts(await getPosts(3));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
        <Button title="Retry" variant="secondary" onPress={load} />
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