import React from 'react';
import styled from 'styled-components';
import { Button } from '../../../../components/ui';
import { SectionTitle, SectionDivider } from '../common';

const Content = styled.div.attrs({ className: 'options-tab-sponsor__content' })`
  text-align: center;
`;

const Text = styled.p.attrs({ className: 'options-tab-sponsor__text' })`
  color: var(--text-secondary);
  margin: 0 0 24px 0;
  font-size: 14px;
  line-height: 1.6;
`;

const Buttons = styled.div.attrs({ className: 'options-tab-sponsor__buttons' })`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 32px;
`;

const SubTitle = styled.h3.attrs({ className: 'options-tab-sponsor__subtitle' })`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
`;

const QRCodes = styled.div.attrs({ className: 'options-tab-sponsor__qr-list' })`
  display: flex;
  justify-content: center;
  gap: 28px;

  @media (max-width: 500px) {
    flex-direction: column;
    align-items: center;
  }
`;

const QRItem = styled.div.attrs({ className: 'options-tab-sponsor__qr-item' })`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const QRCode = styled.img.attrs({ className: 'options-tab-sponsor__qr-code' })`
  width: 160px;
  height: 160px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
`;

const Label = styled.span.attrs({ className: 'options-tab-sponsor__qr-label' })`
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
`;

export function Sponsor() {
  return (
    <div>
      <SectionTitle>Support</SectionTitle>
      <Content>
        <Text>If you find this extension helpful, consider supporting its development.</Text>

        <Buttons>
          <Button
            variant="secondary"
            icon="github"
            onClick={() => window.open('https://github.com/sponsors/ming2k', '_blank')}
          >
            Sponsor on GitHub
          </Button>
          <Button
            variant="secondary"
            icon="coffee"
            onClick={() => window.open('https://buymeacoffee.com/ming2k', '_blank')}
          >
            Buy me a coffee
          </Button>
        </Buttons>

        <SectionDivider style={{ marginBottom: 28 }} />

        <SubTitle>Chinese Users</SubTitle>
        <QRCodes>
          <QRItem>
            <QRCode src="https://cdn.jsdelivr.net/gh/ming2k/img-hosting/mings-wechat-payment-pure-qrcode.png" alt="WeChat Pay" />
            <Label>WeChat Pay</Label>
          </QRItem>
          <QRItem>
            <QRCode src="https://cdn.jsdelivr.net/gh/ming2k/img-hosting/mings-alipay-payment-pure-qrcode.png" alt="Alipay" />
            <Label>Alipay</Label>
          </QRItem>
        </QRCodes>
      </Content>
    </div>
  );
}
