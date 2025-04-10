import React, { useEffect, useState } from 'react';
import { rdsService, s3Service } from '../services/awsService';

const AWSTest: React.FC = () => {
  const [s3Status, setS3Status] = useState<string>('Sprawdzanie...');
  const [rdsStatus, setRdsStatus] = useState<string>('Sprawdzanie...');

  useEffect(() => {
    const testConnections = async () => {
      try {
        // Test S3
        console.log('Testing S3 connection...');
        await s3Service.getFile('test.txt');
        setS3Status('S3: Połączono pomyślnie');
      } catch (error) {
        setS3Status('S3: Błąd połączenia');
        console.error('S3 Error:', error);
      }

      try {
        // Test RDS
        console.log('Testing RDS connection...');
        const result = await rdsService.executeQuery('SELECT 1');
        console.log('RDS query result:', result);
        setRdsStatus('RDS: Połączono pomyślnie');
      } catch (error) {
        setRdsStatus('RDS: Błąd połączenia');
        console.error('RDS Error:', error);
      }
    };

    testConnections();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Test połączenia z AWS</h2>
      <div className="space-y-2">
        <p className={s3Status.includes('Błąd') ? 'text-red-500' : 'text-green-500'}>
          {s3Status}
        </p>
        <p className={rdsStatus.includes('Błąd') ? 'text-red-500' : 'text-green-500'}>
          {rdsStatus}
        </p>
      </div>
    </div>
  );
};

export default AWSTest; 