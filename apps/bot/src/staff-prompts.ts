import { AttachmentBuilder, EmbedBuilder, type Message } from 'discord.js';
import { ids } from '../../../config/ids.js';

export const promptRoleId = '1529545703024627754';
export const promptBanner = 'assets/applications/staff-prompts.png';
const logo = '<:nyc_logo:1572797767557062885>';
const experience = '**Your ROBLOX User:**\n\n**All your previous experiences, please include membercount and your rank. Server invite CODE, if possible:**\n\n';
export const staffPrompts = {
  fastpass: `# ${logo} Fast-Pass\n\n${experience}**Why do you want to be staff here?**`,
  transfer: `# ${logo} Staff Transfer\n\n${experience}**Why do I want to be staff here?**`,
  application: `> We appreciate your interest in joining the NYC Staff Team! Any detection of usage of AI will result in the immediate denial of your application and blacklist from our team. We wish you the best of luck!\n\n# ${logo} Staff Application\n\n1. What is your Roblox & Discord Username?\n\n2. Do you have any past experience as a moderator? If so, list where, membercount, and your role.\n\n3. Why do you want to be a staff member at @ NYC Roleplay?\n\n4. Why do you think you are qualified for staff?\n\n5. What is RDM and give an example.\n\n6. What is VDM and give an example.\n\n7. What is FRP and give an example.\n\n8. A staff member is abusing their permissions. What would you do?\n\n9. A player refuses to cooperate during a staff situation and begins insulting you. How would you handle it?\n\n10. Two players are arguing in-game, and both claim the other violated server rules. How would you investigate?`
};

export function staffPromptPayload(command: keyof typeof staffPrompts) {
  return { embeds: [new EmbedBuilder().setColor(0xFFFFFF).setDescription(staffPrompts[command]).setImage('attachment://nyc-applications.png')], files: [new AttachmentBuilder(promptBanner, {name: 'nyc-applications.png'})], allowedMentions: {parse: [] as never[]} };
}

export async function handleStaffPrompt(message: Message) {
  if(message.author.bot || message.webhookId || message.guildId !== ids.guildId) return false;
  const match = /^!(fastpass|transfer|application)$/i.exec(message.content.trim());
  if(!match) return false;
  const member = await message.guild!.members.fetch({user: message.author.id, force: true});
  if(!member.roles.cache.has(promptRoleId)) return true;
  if(!message.deletable) {
    await message.author.send('I need Manage Messages in that channel to replace your staff prompt command.').catch(()=>{});
    return true;
  }
  if(!message.channel.isSendable()) return true;
  await message.channel.send({...staffPromptPayload(match[1].toLowerCase() as keyof typeof staffPrompts), nonce: message.id, enforceNonce: true});
  await message.delete();
  return true;
}
