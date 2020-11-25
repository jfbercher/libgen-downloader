import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
// @ts-ignore
import pretty from 'prettysize';
import { error_tolarance, error_reconnect_delay_ms } from '../app-config.json';
import { useStore } from '../../store-provider';
import { Entry } from '../../search-api';
import { findDownloadURL, startDownloading } from '../../download-api';

const Downloader = () => {
  const [ running, setRunning ] = useState(false);
  const [ completedFiles, setCompletedFiles ] = useState(1);
  const [ progress, setProgress ] = useState(0);
  const [ total, setTotal ] = useState(0);
  const [ filename, setFilename ] = useState('');
  const [ downloaderStatus, setDownloaderStatus ] = useState<'processing' | 'downloading'>('processing');
  const [ errorStatus, setErrorStatus ] = useState(false);

  const downloadQueue: Entry[] = useStore(state => state.globals.downloadQueue);
  const setDownloadQueue: (callback: Function) => void = useStore(state => state.set.downloadQueue);

  useEffect(() => {
    if (downloadQueue.length > 0 && !running) {
      setCompletedFiles(0);
      setRunning(true);

      const operateQueue = async () => {
        const onData = (chunklen: number, total: number, filename: string) => {
          setDownloaderStatus('downloading');
          setProgress((prev => prev + chunklen));
          setTotal(total);
          setFilename(filename);
        }

        const onEnd = (_: string) => {
          setCompletedFiles(prev => prev + 1);
          setProgress(0);
          setTotal(0);
          setFilename('');
          setDownloadQueue((arr: Entry[]) => arr.slice(1));
        }

        while (useStore.getState().globals.downloadQueue.length > 0) {
          setDownloaderStatus('processing');

          const entryBuffer: Entry = useStore.getState().globals.downloadQueue[0];

          if (!entryBuffer) break;

          const endpoint: string | null = await findDownloadURL(entryBuffer.mirror, () => {}, error_tolarance, error_reconnect_delay_ms);

          if (!endpoint) {
            setDownloadQueue((arr: Entry[]) => arr.slice(1));
            setErrorStatus(true);
            setTimeout(() => {
              setErrorStatus(false);
            }, 2000);
            continue;
          }

          const status: true | null = await startDownloading(endpoint, error_tolarance, error_reconnect_delay_ms, () => {}, onData, onEnd);

          if (!status) {
            setDownloadQueue((arr: Entry[]) => arr.slice(1));
            setErrorStatus(true);
            setTimeout(() => {
              setErrorStatus(false);
            }, 2000);
            continue;
          }
        }

        setRunning(false);
      }

      operateQueue();
    }
  }, [downloadQueue]);

  return (
    <Box flexDirection='column'>
      {
        errorStatus &&
        <Text wrap='truncate'>
          <Text color='red'>Last Download Progress Couldn't Completed</Text>
        </Text>
      }
      {
        downloadQueue.length > 0 &&
        <Text wrap='truncate'>
          { downloaderStatus == 'processing' && <Text color='yellowBright' inverse={true}> PROCESSING </Text> } 
          { downloaderStatus == 'downloading' && <Text color='blueBright' inverse={true}> DOWNLOADING </Text> } 
          &nbsp;DONE:&nbsp;<Text color='greenBright'>{completedFiles}</Text> IN QUEUE:&nbsp;<Text color='yellow'>{downloadQueue.length}</Text>&nbsp;to&nbsp;
          <Text color='blueBright'>{process.cwd()}</Text>
        </Text>
      }
      {
        running && progress != 0 && total != 0 && filename != '' && 
        <Box flexDirection='column'>
          <Text wrap='truncate'>
            <Text color='greenBright'>{(100 / total * progress).toFixed(2)}%</Text>
            &nbsp;
            <Text color='magentaBright'>{pretty(progress)}/{pretty(total)}</Text>
            &nbsp;
            <Text color='yellow'>{filename}</Text>
          </Text>
        </Box>
      }
    </Box>
  )
}

export default Downloader;
