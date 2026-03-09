import { Controller, Post, Get, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { InteractionService } from './interaction.service';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';

@Controller('interactions')
export class InteractionController {
    constructor(private readonly interactionService: InteractionService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('like/:videoId')
    async toggleLike(
        @Param('videoId') videoId: string,
        @Body() body: { isLike: boolean },
        @Request() req
    ) {
        return this.interactionService.toggleLike(req.user.userId, videoId, body.isLike);
    }

    @Throttle({ default: { limit: 5, ttl: 60000 } }) // Max 5 comments per minute
    @UseGuards(AuthGuard('jwt'))
    @Post('comment/:videoId')
    async addComment(
        @Param('videoId') videoId: string,
        @Body() body: { text: string },
        @Request() req
    ) {
        return this.interactionService.addComment(req.user.userId, videoId, body.text);
    }

    @Get('comments/:videoId')
    async getComments(@Param('videoId') videoId: string) {
        return this.interactionService.getComments(videoId);
    }

    @Throttle({ default: { limit: 10, ttl: 60000 } }) // Max 10 view increments per minute
    @Post('view/:videoId')
    async incrementView(@Param('videoId') videoId: string) {
        return this.interactionService.incrementView(videoId);
    }

    @Get('stats/:videoId')
    async getStats(@Param('videoId') videoId: string) {
        return this.interactionService.getStats(videoId);
    }
}
