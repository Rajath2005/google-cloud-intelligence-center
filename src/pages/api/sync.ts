import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export const prerender = false;

export async function POST() {
  try {
    const { stdout, stderr } = await execAsync('npm run sync');
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Sync completed successfully',
      output: stdout,
      error: stderr
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Sync failed',
      error: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
