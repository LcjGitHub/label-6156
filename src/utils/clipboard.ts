/**
 * 将文本写入系统剪贴板
 * 优先使用 navigator.clipboard API，失败时降级到 document.execCommand 方案
 * 所有异常均会被捕获并通过返回值标识，不会向上抛出
 *
 * @param text - 需要复制到剪贴板的文本内容
 * @returns 复制成功返回 true，失败返回 false
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      return successful;
    } finally {
      document.body.removeChild(textArea);
    }
  } catch {
    console.error('Failed to copy text to clipboard');
    return false;
  }
}
