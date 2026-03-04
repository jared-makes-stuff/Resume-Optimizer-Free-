import { useState, useRef } from 'react';
import { QrCode, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import './QRCodeDisplay.css';

function QRCodeDisplay({ profileUrl }) {
  const [isInverted, setIsInverted] = useState(false);
  const [size, setSize] = useState(200);
  const qrRef = useRef(null);

  const downloadQR = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = size;
    canvas.height = size;
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = 'linkedin-qr-code.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (!profileUrl) {
    return (
      <div className="qr-code-display">
        <h3>
          <QrCode size={20} />
          LinkedIn QR Code
        </h3>
        <div className="qr-placeholder">
          <p>No LinkedIn URL available</p>
        </div>
      </div>
    );
  }

  const bgColor = isInverted ? '#000000' : '#ffffff';
  const fgColor = isInverted ? '#ffffff' : '#000000';

  return (
    <div className="qr-code-display">
      <h3>
        <QrCode size={20} />
        LinkedIn QR Code
      </h3>
      
      <div className="qr-container" ref={qrRef}>
        <QRCodeSVG
          value={profileUrl}
          size={size}
          bgColor={bgColor}
          fgColor={fgColor}
          level="M"
          includeMargin={true}
        />
      </div>

      <div className="qr-controls">
        <label className="toggle-control">
          <input
            type="checkbox"
            checked={isInverted}
            onChange={(e) => setIsInverted(e.target.checked)}
          />
          <span>Inverted</span>
        </label>

        <button onClick={downloadQR} className="download-btn">
          <Download size={16} />
          Download PNG
        </button>
      </div>

      <div className="qr-info">
        <p>Scan to visit your LinkedIn profile</p>
      </div>
    </div>
  );
}

export default QRCodeDisplay;
