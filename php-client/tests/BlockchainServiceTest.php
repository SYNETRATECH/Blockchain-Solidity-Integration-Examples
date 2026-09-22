<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use App\BlockchainService;

class BlockchainServiceTest extends TestCase
{
    public function testGetGreetingThrowsExceptionWhenArtifactIsMissing()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage("Artifact not found at invalid/path.json");

        new BlockchainService('http://127.0.0.1:8545', '0x123', 'invalid/path.json');
    }
}
